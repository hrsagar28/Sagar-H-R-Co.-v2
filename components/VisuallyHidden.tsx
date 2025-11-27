import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: React.ElementType;
}

const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, as: Tag = 'span' }) => (
  <Tag className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0, 0, 0, 0)' }}>
    {children}
  </Tag>
);

export default VisuallyHidden;