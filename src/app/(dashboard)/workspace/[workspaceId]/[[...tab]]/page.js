'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import ResizablePanel from '@/components/layout/ResizablePanel';
import RequestPanel from '@/components/request/RequestPanel';
import DashboardPanel from '@/components/dashboard/DashboardPanel';
import WorkflowList from '@/components/workflow/WorkflowList';
import MainCanvas from '@/components/workflow/MainCanvas';
import { useAppStore } from '@/store/useAppStore';

const SIDEBAR_MAPPING = {
    collections: 'Collections',
    monitor: 'Monitor',
    environments: 'Environments',
    history: 'History',
    apis: 'APIs',
    workflows: 'Workflows'
};

export default function WorkspaceEditor() {
    const { workspaceId, tab } = useParams();
    const { activeView, setActiveWorkspace, setActiveSidebarItem, setActiveView } = useAppStore();

    // 1. Determine URL parameters
    const currentRoute = tab && tab[0] ? tab[0].toLowerCase() : null;
    const isWorkflowRoute = currentRoute === 'workflows';
    const workflowId = isWorkflowRoute && tab.length > 1 ? tab[1] : null;

    // 2. Set active workspace from URL
    useEffect(() => {
        if (workspaceId) {
            setActiveWorkspace(workspaceId);
        }
    }, [workspaceId, setActiveWorkspace]);

    // 3. Sync URL → Zustand state (Runs on hard refreshes or direct URL visits)
    useEffect(() => {
        if (currentRoute) {
            const mappedTab = SIDEBAR_MAPPING[currentRoute] || 'Collections';
            setActiveSidebarItem(mappedTab);
            
            // Sync the activeView based on the route
            if (isWorkflowRoute) {
                setActiveView('workflow');
            } else if (currentRoute === 'dashboard') {
                setActiveView('dashboard');
            } else {
                setActiveView('runner');
            }
        } else {
            setActiveSidebarItem('Collections');
            setActiveView('runner');
        }
    }, [currentRoute, isWorkflowRoute, setActiveSidebarItem, setActiveView]);

    // 4. Render Logic
    if (activeView === 'dashboard') {
        return <DashboardPanel />;
    }

    if (activeView === 'workflow') {
        // ✨ Render Workflow Logic based on whether a workflowId exists in the URL
        if (workflowId) {
            return <MainCanvas workflowId={workflowId} />;
        } else {
            return <WorkflowList />;
        }
    }

    // Default Fallback (API Runner)
    return (
        <>
            <ResizablePanel />
            <RequestPanel />
        </>
    );
}