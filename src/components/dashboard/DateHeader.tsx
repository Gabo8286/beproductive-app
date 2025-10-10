import React from "react";

export const DateHeader: React.FC = () => {
  const today = new Date();

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-foreground tracking-tight">
        Today, {formatDate(today)}
      </h1>
    </div>
  );
};