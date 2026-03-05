'use client';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    useReactFlow,
    BackgroundVariant,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Play, Square } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api, WS_URL } from '@/lib/api';

import StartNode from './nodes/StartNode';
import RequestNode from './nodes/RequestNode';
import ConditionNode from './nodes/ConditionNode';
import TransformNode from './nodes/TransformNode';
import DelayNode from './nodes/DelayNode';
import TestNode from './nodes/TestNode';
import ScriptNode from './nodes/ScriptNode';
import EndNode from './nodes/EndNode';
import NodeLibrary from './NodeLibrary';
import NodeConfigPanel from './NodeConfigPanel';

const nodeTypes = {
    startNode: StartNode,
    requestNode: RequestNode,
    conditionNode: ConditionNode,
    transformNode: TransformNode,
    delayNode: DelayNode,
    testNode: TestNode,
    scriptNode: ScriptNode,
    endNode: EndNode,
};

const initialNodes = [
    { id: 'start-1', type: 'startNode', position: { x: 100, y: 200 }, data: {} },
];

let idCounter = 1;
const getId = () => `node_${idCounter++}`;

function CanvasEditor({ initialData, onSave }) {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes?.length > 0 ? initialData.nodes : initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges?.length > 0 ? initialData.edges : []);

    // STATE TO TRACK SELECTION
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const { activeWorkspace } = useAppStore();

    // EXECUTION STATE
    const [clientId] = useState(() => Math.random().toString(36).substring(7));
    const [isRunning, setIsRunning] = useState(false);

    const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#FF6F00', strokeWidth: 2 } }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow');
            const dataStr = event.dataTransfer.getData('application/reactflow-data');
            if (!type) return;

            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const newNode = {
                id: getId(),
                type,
                position,
                data: dataStr ? JSON.parse(dataStr) : {},
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNodeId(newNode.id); // Auto-select on drop
        },
        [screenToFlowPosition, setNodes],
    );

    // ✨ HANDLER TO UPDATE NODE DATA INSTANTLY
    const updateNodeData = useCallback((nodeId, newData) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    }, [setNodes]);

    const handleSaveWorkflow = () => {
        const flowData = { nodes: getNodes(), edges: getEdges() };
        if (onSave) onSave(flowData);
    };

    // ✨ WEBSOCKET CONNECTION
    useEffect(() => {
        // Use WS_URL directly so it goes through the Nginx /api/ route
        const ws = new WebSocket(`${WS_URL}/?clientId=${clientId}`);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'node-start') {
                    updateNodeData(data.nodeId, { executionStatus: 'running' });
                } else if (data.type === 'node-complete') {
                    updateNodeData(data.nodeId, { executionStatus: 'success' });
                } else if (data.type === 'node-error') {
                    updateNodeData(data.nodeId, { executionStatus: 'failed', error: data.error });
                } else if (data.type === 'workflow-complete' || data.type === 'workflow-error') {
                    setIsRunning(false);
                }
            } catch (e) { }
        };

        return () => ws.close();
    }, [clientId, updateNodeData]);

    // ✨ RUN WORKFLOW
    const handleRunWorkflow = async () => {
        setIsRunning(true);
        // Reset node states
        setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, executionStatus: 'idle', error: null } })));

        const flowData = { nodes: getNodes(), edges: getEdges() };
        try {
            await api.post('/workflows/run-canvas', { workflow: flowData, clientId });
        } catch (err) {
            console.error(err);
            setIsRunning(false);
        }
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <div className="w-full h-full relative bg-[#0B0B0B] flex overflow-hidden" ref={reactFlowWrapper}>
            <NodeLibrary />

            {/* CANVAS CONTAINER */}
            <div className="flex-1 h-full relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={(e, node) => setSelectedNodeId(node.id)} // ✨ SELECT ON CLICK
                    onPaneClick={() => setSelectedNodeId(null)} // ✨ DESELECT ON CANVAS CLICK
                    nodeTypes={nodeTypes}
                    fitView
                    colorMode="dark"
                >
                    {/* Top Right Save Button inside the canvas */}
                    <Panel position="top-right" className="m-4 flex items-center gap-3">
                        <button
                            onClick={handleRunWorkflow}
                            disabled={isRunning}
                            className={`flex items-center gap-2 font-bold py-2 px-4 rounded-lg shadow-lg transition-colors ${isRunning ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                        >
                            {isRunning ? <Square size={16} className="animate-pulse" /> : <Play size={16} />}
                            {isRunning ? 'Running...' : 'Run Workflow'}
                        </button>

                        <button
                            onClick={handleSaveWorkflow}
                            className="flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors"
                        >
                            <Save size={16} /> Save
                        </button>
                    </Panel>

                    <Controls className="bg-bg-panel border-border-subtle fill-text-primary" />
                    <MiniMap
                        nodeStrokeWidth={3} zoomable pannable
                        nodeColor={(n) => n.type === 'startNode' ? '#10b981' : n.type === 'conditionNode' ? '#a855f7' : '#3b82f6'}
                        maskColor="#00000080" className="bg-bg-panel border-border-strong"
                    />
                    <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#333" />
                </ReactFlow>
            </div>

            {/* THE SIDEBAR CONFIG PANEL */}
            {selectedNode && (
                <NodeConfigPanel
                    selectedNode={selectedNode}
                    updateNodeData={updateNodeData}
                    onClose={() => setSelectedNodeId(null)}
                />
            )}
        </div>
    );
}

export default function WorkflowCanvasWrapper({ initialData, onSave }) {
    return (
        <ReactFlowProvider>
            {/* We pass the initialData down to CanvasEditor */}
            <CanvasEditor initialData={initialData} onSave={onSave} />
        </ReactFlowProvider>
    );
}