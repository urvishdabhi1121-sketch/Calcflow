import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getTool } from '@/lib/toolRegistry';

export default function ToolPage() {
  const { toolId } = useParams();
  const tool = getTool(toolId);
  if (!tool) return <Navigate to="/tools" replace />;
  const Component = tool.component;
  return <Component />;
}