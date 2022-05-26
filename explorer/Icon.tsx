import { memo } from 'react';
import type { CSSProperties, FC } from 'react';
import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import type icons from 'bootstrap-icons/font/bootstrap-icons.json';

export type IconType = keyof typeof icons;

export interface IConProps {
  type: IconType;
  color?: string;
  size?: number;
  style?: CSSProperties;
  title?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const Icon: FC<IConProps> = ({
  type,
  color = '#333',
  size = 22,
  className,
  onClick,
  title,
  style = {},
}) => {
  return (
    <i
      title={title}
      onClick={onClick}
      style={{ ...style, fontSize: size, color }}
      className={`bi bi-${type} ${className || ''}`}
    ></i>
  );
};

export default memo(Icon);
