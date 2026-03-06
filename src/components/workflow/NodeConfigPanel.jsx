'use client';
import React, { useMemo, useState } from 'react';
import { Settings2, GitBranch, Globe, X, FileJson, Clock, FlaskConical, Terminal, Flag, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function NodeConfigPanel({ selectedNode, deleteNode, updateNodeData, onClose }) {
  const { requestStates, collections, activeWorkspaceId } = useAppStore();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [previewReqId, setPreviewReqId] = useState(null);

  const workspaceRequests = useMemo(() => {
    const validCollectionIds = new Set();
    const extractCollectionIds = (cols) => {
        cols.forEach(c => {
            if (c.workspaceId === activeWorkspaceId) {
                validCollectionIds.add(c.id);
                if (c.children) extractCollectionIds(c.children);
            }
        });
    };
    extractCollectionIds(collections || []);

    return Object.values(requestStates || {}).filter(req => 
        validCollectionIds.has(req.collectionId)
    );
  }, [requestStates, collections, activeWorkspaceId]);

  if (!selectedNode) return null;

  const { id, type, data } = selectedNode;

  const handleDataChange = (key, value) => {
    updateNodeData(id, { [key]: value });
  };

  const handleDelete = () => {
    deleteNode(id);
    onClose();
  };

  const methodColorMap = {
    GET: 'text-method-get',
    POST: 'text-method-post',
    PUT: 'text-method-put',
    DELETE: 'text-method-delete',
    PATCH: 'text-purple-400',
    OPTIONS: 'text-gray-400',
    HEAD: 'text-gray-400'
  };

  return (
    <div className="w-80 h-full bg-bg-panel border-l border-border-strong flex flex-col shadow-2xl animate-in slide-in-from-right-8 duration-200 z-20 absolute right-0 top-0">
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-base/50 shrink-0">
        <div className="flex items-center gap-2">
          {type === 'requestNode' && <Globe size={16} className="text-brand-blue" />}
          {type === 'conditionNode' && <GitBranch size={16} className="text-purple-500" />}
          {type === 'startNode' && <Settings2 size={16} className="text-emerald-500" />}
          {type === 'transformNode' && <FileJson size={16} className="text-blue-400" />}
          {type === 'delayNode' && <Clock size={16} className="text-yellow-500" />}
          {type === 'testNode' && <FlaskConical size={16} className="text-pink-500" />}
          {type === 'scriptNode' && <Terminal size={16} className="text-cyan-400" />}
          {type === 'endNode' && <Flag size={16} className="text-red-500" />}
          <h3 className="font-bold text-sm text-text-primary capitalize">
            {type.replace('Node', '')} Settings
          </h3>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded transition-colors hover:bg-bg-input">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">

        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Internal Node ID</label>
          <div className="font-mono text-xs text-text-secondary bg-bg-input px-2 py-1.5 rounded border border-border-subtle">
            {id}
          </div>
        </div>

        {type === 'requestNode' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="relative">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Select Request</label>

              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-[#0d0d0d] border border-border-subtle hover:border-brand-blue/50 rounded-lg px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors"
              >
                {data.requestId && requestStates[data.requestId] ? (
                  <div className="flex items-center gap-2 truncate">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded bg-white/5 uppercase ${methodColorMap[(requestStates[data.requestId]?.config?.method || 'GET').toUpperCase()] || 'text-method-get'}`}>
                      {requestStates[data.requestId]?.config?.method || 'GET'}
                    </span>
                    <span className="truncate text-white text-xs font-medium">
                      {requestStates[data.requestId].name || 'Untitled Request'}
                    </span>
                  </div>
                ) : (
                  <span className="text-text-muted text-xs">-- Choose a Request --</span>
                )}
              </div>

              {isDropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-bg-panel border border-border-strong rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-white/5 bg-black/20">
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      className="w-full bg-transparent text-xs text-white placeholder-text-muted focus:outline-none px-1"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar py-1">
                    {workspaceRequests.length === 0 ? (
                       <div className="p-3 text-center text-xs text-text-muted">No requests in this workspace</div>
                    ) : workspaceRequests
                      .filter(r => r.name.toLowerCase().includes(dropdownSearch.toLowerCase()))
                      .map(req => (
                        <div key={req.id} className="flex flex-col border-b border-border-subtle last:border-0">

                          <div
                            className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${data.requestId === req.id ? 'bg-brand-blue/10 border-l-2 border-brand-blue' : 'border-l-2 border-transparent'}`}
                          >
                            <div 
                              className="flex items-center gap-2 overflow-hidden flex-1"
                              onClick={() => {
                                handleDataChange('requestId', req.id);
                                handleDataChange('method', req.config?.method || 'GET');
                                handleDataChange('url', req.config?.url || '');
                                setIsDropdownOpen(false);
                                setDropdownSearch('');
                                setPreviewReqId(null);
                              }}
                            >
                              <span className={`text-[9px] font-black px-1 py-0.5 rounded bg-black/40 uppercase ${methodColorMap[(req.config?.method || 'GET').toUpperCase()] || 'text-method-get'}`}>
                                {req.config?.method || 'GET'}
                              </span>
                              <span className="truncate text-xs font-semibold text-text-primary">
                                {req.name}
                              </span>
                            </div>
                            
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPreviewReqId(previewReqId === req.id ? null : req.id); }}
                              className="p-1 text-text-muted hover:text-brand-orange hover:bg-bg-input rounded transition-colors shrink-0"
                              title="Preview Request Details"
                            >
                              {previewReqId === req.id ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>

                          {previewReqId === req.id && (
                            <div className="px-3 py-2 bg-black/40 text-[10px] font-mono text-text-secondary space-y-1">
                              <p className="truncate text-brand-blue">{req.config?.url || 'No URL'}</p>

                              {Array.isArray(req.config?.headers) && req.config.headers.some(h => h.key && h.active !== false) && (
                                <p className="truncate">
                                  <span className="text-text-muted">Headers:</span> {req.config.headers.filter(h => h.key && h.active !== false).map(h => h.key).join(', ')}
                                </p>
                              )}

                              {req.config?.body?.type !== 'none' && (
                                <p className="truncate">
                                  <span className="text-text-muted">Body:</span> {req.config.body?.type} ({req.config.body?.language || 'auto'})
                                </p>
                              )}
                            </div>
                          )}

                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Timeout (ms)</label>
              <input
                type="number"
                value={data.timeout || 5000}
                onChange={(e) => handleDataChange('timeout', parseInt(e.target.value))}
                className="w-full bg-[#0d0d0d] border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-mono text-text-primary"
              />
            </div>
          </div>
        )}

        {type === 'conditionNode' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">JavaScript Expression (JEXL)</label>
              <textarea
                value={data.expression || ''}
                onChange={(e) => handleDataChange('expression', e.target.value)}
                placeholder="responses['node_1'].status === 200"
                className="w-full h-24 bg-[#0d0d0d] border border-border-subtle rounded-lg p-3 text-xs font-mono text-purple-400 focus:outline-none focus:border-purple-500 custom-scrollbar resize-none"
              />
            </div>
            <p className="text-xs text-text-muted bg-purple-500/5 border border-purple-500/20 p-3 rounded-lg leading-relaxed">
              If the expression evaluates to <strong className="text-emerald-500">true</strong>, the workflow takes the top branch. If <strong className="text-red-500">false</strong>, it takes the bottom branch.
            </p>
          </div>
        )}

        {type === 'startNode' && (
          <p className="text-xs text-text-muted text-center mt-4">
            The Start node requires no configuration. Execution begins here.
          </p>
        )}

        {type === 'transformNode' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Target Variable Name</label>
              <input
                type="text"
                value={data.variable || ''}
                onChange={(e) => handleDataChange('variable', e.target.value)}
                placeholder="variables.token"
                className="w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-mono text-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Value Expression (JEXL)</label>
              <textarea
                value={data.expression || ''}
                onChange={(e) => handleDataChange('expression', e.target.value)}
                placeholder="responses.node_1.body.token"
                className="w-full h-24 bg-[#0d0d0d] border border-border-subtle rounded-lg p-3 text-xs font-mono text-blue-400 focus:outline-none focus:border-brand-blue custom-scrollbar resize-none"
              />
            </div>
          </div>
        )}

        {type === 'delayNode' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Delay (ms)</label>
              <input
                type="number"
                value={data.delay || 1000}
                onChange={(e) => handleDataChange('delay', parseInt(e.target.value, 10))}
                className="w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-mono text-yellow-500"
              />
            </div>
          </div>
        )}

        {type === 'testNode' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Assertion Expression (JEXL)</label>
              <textarea
                value={data.assertion || ''}
                onChange={(e) => handleDataChange('assertion', e.target.value)}
                placeholder="responses.node_1.status === 200"
                className="w-full h-24 bg-[#0d0d0d] border border-border-subtle rounded-lg p-3 text-xs font-mono text-pink-500 focus:outline-none focus:border-pink-500 custom-scrollbar resize-none"
              />
            </div>
          </div>
        )}

        {type === 'scriptNode' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">JavaScript Code</label>
              <textarea
                value={data.script || ''}
                onChange={(e) => handleDataChange('script', e.target.value)}
                placeholder="context.variables.custom = 'hello';"
                className="w-full h-48 bg-[#0d0d0d] border border-border-subtle rounded-lg p-3 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-400 custom-scrollbar resize-none"
              />
            </div>
            <p className="text-[10px] text-text-muted">Runs in a secure sandbox. Modify <code className="text-cyan-400">context.variables</code> directly.</p>
          </div>
        )}

        {type === 'endNode' && (
          <p className="text-xs text-text-muted text-center mt-4">
            The End node marks the completion of a workflow path.
          </p>
        )}
      </div>

      {type !== 'startNode' && (
        <div className="p-4 border-t border-border-subtle bg-bg-base/30 shrink-0">
            <button 
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 border border-red-500/20 py-2 rounded-lg text-sm font-bold transition-colors"
            >
                <Trash2 size={16} /> Delete Node
            </button>
        </div>
      )}
    </div>
  );
}