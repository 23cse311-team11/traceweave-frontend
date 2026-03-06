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
import { Save, Play, Square, Terminal, X, AlignLeft, Variable, ListTree, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api, WS_URL } from '@/lib/api';
import { nanoid } from 'nanoid';

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

const getId = () => `node_${nanoid()}`;

// ✨ CONTEXT MENU COMPONENT
const ContextMenu = ({ id, top, left, type, onClose, onDelete }) => {
    return (
        <div
            style={{ top, left }}
            className="fixed z-[100] min-w-[160px] bg-bg-panel border border-border-strong rounded-lg shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle mb-1">
                {type === 'node' ? 'Node' : 'Edge'} Actions
            </div>
            <button
                onClick={() => {
                    onDelete(id, type);
                    onClose();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
            >
                <Trash2 size={14} /> Delete {type === 'node' ? 'Node' : 'Edge'}
            </button>
        </div>
    );
};

function CanvasEditor({ initialData, onSave }) {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes?.length > 0 ? initialData.nodes : initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges?.length > 0 ? initialData.edges : []);

    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const { activeWorkflow } = useAppStore();

    const [clientId] = useState(() => Math.random().toString(36).substring(7));
    const [isRunning, setIsRunning] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [executionResults, setExecutionResults] = useState(null);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const [consoleTab, setConsoleTab] = useState('logs');

    const [consoleHeight, setConsoleHeight] = useState(300);
    const [isResizing, setIsResizing] = useState(false);

    // ✨ CONTEXT MENU STATE
    const [menu, setMenu] = useState(null);

    const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

    const handleNodesChange = useCallback((changes) => {
        onNodesChange(changes);
        setIsDirty(true);
    }, [onNodesChange]);

    const handleNodesDelete = useCallback((deleted) => {
        setIsDirty(true);
        if (deleted.some(n => n.id === selectedNodeId)) setSelectedNodeId(null);
    }, [selectedNodeId]);

    const handleEdgesChange = useCallback((changes) => {
        onEdgesChange(changes);
        setIsDirty(true);
    }, [onEdgesChange]);

    const handleEdgesDelete = useCallback(() => {
        setIsDirty(true);
    }, []);

    // ✨ REFACTORED DELETE LOGIC
    const deleteElement = useCallback((id, type) => {
        if (type === 'node') {
            setNodes((nds) => nds.filter((n) => n.id !== id));
            setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
            if (id === selectedNodeId) setSelectedNodeId(null);
        } else {
            setEdges((eds) => eds.filter((e) => e.id !== id));
        }
        setIsDirty(true);
    }, [setNodes, setEdges, selectedNodeId]);

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#FF6F00', strokeWidth: 2 } }, eds));
        setIsDirty(true);
    }, [setEdges]);

    // ✨ RIGHT CLICK HANDLERS
    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault();
        setMenu({
            id: node.id,
            type: 'node',
            top: event.clientY,
            left: event.clientX,
        });
    }, []);

    const onEdgeContextMenu = useCallback((event, edge) => {
        event.preventDefault();
        setMenu({
            id: edge.id,
            type: 'edge',
            top: event.clientY,
            left: event.clientX,
        });
    }, []);

    const onPaneClick = useCallback(() => {
        setMenu(null);
        setSelectedNodeId(null);
    }, []);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
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
        setSelectedNodeId(newNode.id);
        setIsDirty(true);
    }, [screenToFlowPosition, setNodes]);

    const updateNodeData = useCallback((nodeId, newData) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return { ...node, data: { ...node.data, ...newData } };
            }
            return node;
        }));
        if (!newData.hasOwnProperty('executionStatus') && !newData.hasOwnProperty('error')) {
            setIsDirty(true);
        }
    }, [setNodes]);

    const handleSaveWorkflow = () => {
        const flowData = { nodes: getNodes(), edges: getEdges() };
        if (onSave) onSave(flowData);
        setIsDirty(false);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newHeight = window.innerHeight - e.clientY;
            if (newHeight > 150 && newHeight < window.innerHeight * 0.8) {
                setConsoleHeight(newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.userSelect = '';
        };

        if (isResizing) {
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}/?clientId=${clientId}`);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'node-start') {
                    updateNodeData(data.nodeId, { executionStatus: 'running', error: null });
                } else if (data.type === 'node-complete') {
                    updateNodeData(data.nodeId, { executionStatus: 'success' });
                } else if (data.type === 'node-error') {
                    updateNodeData(data.nodeId, { executionStatus: 'failed', error: data.error });
                } else if (data.type === 'workflow-complete' || data.type === 'workflow-error') {
                    setIsRunning(false);
                    if (data.context) {
                        setExecutionResults(data.context);
                        setIsConsoleOpen(true);
                    }
                }
            } catch (e) { }
        };

        return () => ws.close();
    }, [clientId, updateNodeData]);

    const handleRunWorkflow = async () => {
        if (isRunning) {
            setIsRunning(false);
            setNodes((nds) => nds.map((n) => (n.data.executionStatus === 'running' ? { ...n, data: { ...n.data, executionStatus: 'idle' } } : n)));
            return;
        }

        setIsRunning(true);
        setIsConsoleOpen(false);
        setExecutionResults(null);
        setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, executionStatus: 'idle', error: null } })));

        const store = useAppStore.getState();
        const envs = store.workspaceEnvironments[store.activeWorkspaceId] || [];
        const activeEnv = envs[store.selectedEnvIndex];
        const environmentValues = activeEnv ? activeEnv.variables.reduce((acc, v) => {
            if (v.key && v.active !== false) acc[v.key] = v.value;
            return acc;
        }, {}) : {};

        const hydratedNodes = getNodes().map(node => {
            if (node.type === 'requestNode' && node.data.requestId) {
                const fullReq = store.requestStates[node.data.requestId];
                if (fullReq) {
                    return { ...node, data: { ...node.data, requestConfig: fullReq.config } };
                }
            }
            return node;
        });

        const flowData = { nodes: hydratedNodes, edges: getEdges() };

        try {
            await api.post('/workflows/run-canvas', {
                workflowId: activeWorkflow?.id,
                workflow: flowData,
                clientId,
                environmentValues
            });
        } catch (err) {
            console.error(err);
            setIsRunning(false);
        }
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <div className="w-full h-full relative bg-[#0B0B0B] flex overflow-hidden" ref={reactFlowWrapper}>
            <NodeLibrary />

            <div className="flex-1 h-full relative flex flex-col">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={(e, node) => { setMenu(null); setSelectedNodeId(node.id); }}
                    onPaneClick={onPaneClick}
                    onNodeContextMenu={onNodeContextMenu}
                    onEdgeContextMenu={onEdgeContextMenu}
                    onNodesDelete={handleNodesDelete}
                    onEdgesDelete={handleEdgesDelete}
                    nodeTypes={nodeTypes}
                    fitView
                    colorMode="dark"
                >
                    <Panel position="top-right" className="m-4 z-40">
                        <div className="flex items-center gap-1 bg-bg-panel/80 backdrop-blur-md p-1.5 rounded-xl border border-border-strong shadow-2xl">
                            <button
                                onClick={handleRunWorkflow}
                                className={`flex items-center gap-2 font-medium text-sm py-2 px-4 rounded-lg transition-all duration-200 ${
                                    isRunning 
                                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                                    : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                }`}
                            >
                                {isRunning ? <Square size={16} className="animate-pulse" /> : <Play size={16} fill="currentColor" />}
                                {isRunning ? 'Stop Execution' : 'Run'}
                            </button>

                            <div className="w-[1px] h-6 bg-border-strong mx-1" />

                            <button
                                onClick={handleSaveWorkflow}
                                disabled={!isDirty}
                                className={`flex items-center gap-2 font-medium text-sm py-2 px-4 rounded-lg transition-all duration-200 ${
                                    isDirty 
                                    ? 'bg-white/10 text-white hover:bg-white/20' 
                                    : 'text-text-muted cursor-not-allowed opacity-50'
                                }`}
                            >
                                <Save size={16} /> 
                                {isDirty ? 'Save Changes' : 'Saved'}
                            </button>
                        </div>
                    </Panel>

                    {executionResults && !isConsoleOpen && (
                        <Panel position="bottom-right" className="m-4 z-40">
                             <button 
                                onClick={() => setIsConsoleOpen(true)} 
                                className="flex items-center gap-2 bg-bg-panel/90 backdrop-blur-md border border-border-strong px-4 py-2.5 rounded-xl text-sm font-medium text-text-primary hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
                             >
                                 <Terminal size={16} className="text-emerald-500"/> View Results
                             </button>
                        </Panel>
                    )}

                    <Controls className="bg-bg-panel border-border-subtle fill-text-primary rounded-xl overflow-hidden shadow-lg" />
                    <MiniMap
                        nodeStrokeWidth={3} zoomable pannable
                        nodeColor={(n) => n.type === 'startNode' ? '#10b981' : n.type === 'conditionNode' ? '#a855f7' : '#3b82f6'}
                        maskColor="#0B0B0BCC" 
                        className="bg-bg-panel border border-border-strong rounded-xl overflow-hidden shadow-lg"
                    />
                    <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#333" />
                </ReactFlow>

                {/* ✨ RENDER CONTEXT MENU */}
                {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} onDelete={deleteElement} />}

                {/* ✨ RESIZABLE BOTTOM DEBUG CONSOLE ✨ */}
                {isConsoleOpen && executionResults && (
                    <div 
                        style={{ height: `${consoleHeight}px` }}
                        className="absolute bottom-0 left-0 right-0 bg-[#0F0F0F]/95 backdrop-blur-xl border-t border-border-strong shadow-[0_-10px_50px_rgba(0,0,0,0.6)] z-40 flex flex-col transition-transform duration-300 ease-out"
                    >
                        <div 
                            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center group -mt-1 z-50"
                            onMouseDown={() => setIsResizing(true)}
                        >
                            <div className={`w-12 h-1 rounded-full transition-colors ${isResizing ? 'bg-brand-orange' : 'bg-border-strong group-hover:bg-text-muted'}`} />
                        </div>

                        <div className="flex items-center justify-between px-4 pt-2 border-b border-border-subtle bg-transparent shrink-0">
                            <div className="flex items-center gap-6">
                                <h3 className="text-sm font-bold font-mono text-text-primary flex items-center gap-2 py-3 border-r border-border-subtle pr-6">
                                    <Terminal size={16} className="text-emerald-500" /> Execution Context
                                </h3>
                                <div className="flex gap-4 text-sm font-medium">
                                    <button onClick={() => setConsoleTab('logs')} className={`py-3 transition-colors flex items-center gap-2 relative ${consoleTab === 'logs' ? 'text-brand-orange' : 'text-text-muted hover:text-text-primary'}`}>
                                        <AlignLeft size={15} /> Logs
                                        {consoleTab === 'logs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-t-full" />}
                                    </button>
                                    <button onClick={() => setConsoleTab('responses')} className={`py-3 transition-colors flex items-center gap-2 relative ${consoleTab === 'responses' ? 'text-blue-400' : 'text-text-muted hover:text-text-primary'}`}>
                                        <ListTree size={15} /> Responses
                                        {consoleTab === 'responses' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-t-full" />}
                                    </button>
                                    <button onClick={() => setConsoleTab('variables')} className={`py-3 transition-colors flex items-center gap-2 relative ${consoleTab === 'variables' ? 'text-purple-400' : 'text-text-muted hover:text-text-primary'}`}>
                                        <Variable size={15} /> Variables
                                        {consoleTab === 'variables' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-t-full" />}
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setIsConsoleOpen(false)} className="p-1.5 hover:bg-white/10 rounded-md text-text-muted hover:text-white transition-colors">
                                <X size={18}/>
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar p-5">
                            {consoleTab === 'logs' && (
                                <ul className="space-y-2 font-mono text-[13px] leading-relaxed">
                                    {executionResults.logs?.length === 0 && <span className="text-text-muted italic flex items-center gap-2"><AlignLeft size={14}/> No logs generated during this run.</span>}
                                    {executionResults.logs?.map((log, i) => (
                                        <li key={i} className={`flex items-start gap-3 py-1 ${log.startsWith('Error') ? 'text-red-400' : 'text-text-secondary'}`}>
                                            <span className="text-text-muted shrink-0 select-none">[{String(i+1).padStart(2, '0')}]</span> 
                                            <span className="break-words">{log}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {consoleTab === 'responses' && (
                                <pre className="text-[13px] font-mono text-blue-300 whitespace-pre-wrap break-words bg-[#0a0a0a] p-4 rounded-lg border border-border-subtle shadow-inner">
                                    {JSON.stringify(executionResults.responses, null, 2) || '{}'}
                                </pre>
                            )}
                            {consoleTab === 'variables' && (
                                <pre className="text-[13px] font-mono text-purple-300 whitespace-pre-wrap break-words bg-[#0a0a0a] p-4 rounded-lg border border-border-subtle shadow-inner">
                                    {JSON.stringify(executionResults.variables, null, 2) || '{}'}
                                </pre>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {selectedNode && (
                <NodeConfigPanel
                    selectedNode={selectedNode}
                    updateNodeData={updateNodeData}
                    deleteNode={(id) => deleteElement(id, 'node')}
                    onClose={() => setSelectedNodeId(null)}
                />
            )}
        </div>
    );
}

export default function WorkflowCanvasWrapper({ initialData, onSave }) {
    return (
        <ReactFlowProvider>
            <CanvasEditor initialData={initialData} onSave={onSave} />
        </ReactFlowProvider>
    );
}