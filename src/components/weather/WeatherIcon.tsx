import React from "react";

interface WeatherIconProps {
  icon: string;
  size: number;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({
  icon,
  size,
  className = "",
}) => {
  const iconUrl = icon
    ? `https://openweathermap.org/img/wn/${icon}@2x.png`
    : `https://openweathermap.org/img/wn/01d@2x.png`; // Default icon

  return (
    <img
      src={iconUrl}
      alt="Weather icon"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default WeatherIcon;
