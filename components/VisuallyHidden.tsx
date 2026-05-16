import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: React.ElementType;
}

const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, as: Tag = 'span' }) => (
  <Tag
    className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0"
    style={{ clip: 'rect(0, 0, 0, 0)' }}
  >
    {children}
  </Tag>
);

export default VisuallyHidden;
