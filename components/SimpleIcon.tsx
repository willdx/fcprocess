import React from 'react';
import * as icons from 'simple-icons';

interface SimpleIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * SimpleIcon 组件 - 用于渲染 Simple Icons 的 SVG 图标
 * @param name - Simple Icons 的图标名称 (如 'siMysql', 'siRedis')
 * @param size - 图标尺寸,默认 16px
 * @param color - 自定义颜色,如果不提供则使用品牌官方颜色
 * @param className - 额外的 CSS 类名
 */
const SimpleIcon: React.FC<SimpleIconProps> = ({ 
  name, 
  size = 16, 
  color,
  className = '' 
}) => {
  // 从 simple-icons 包中获取图标数据
  const iconData = (icons as any)[name];

  if (!iconData) {
    console.warn(`Simple icon "${name}" not found in simple-icons package.`);
    return null;
  }

  const fillColor = color || `#${iconData.hex}`;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fillColor}
      className={className}
      aria-label={iconData.title}
    >
      <path d={iconData.path} />
    </svg>
  );
};

export default SimpleIcon;
