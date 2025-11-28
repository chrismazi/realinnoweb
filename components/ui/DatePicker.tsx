/**
 * Date Picker Component
 * A fully functional date picker with calendar view
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import { useClickOutside } from '../../hooks/usePerformance';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = memo(({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);
  
  const containerRef = useClickOutside(() => setIsOpen(false));

  useEffect(() => {
    setSelectedDate(value);
    if (value) {
      setCurrentMonth(value);
    }
  }, [value]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    // Check if date is within bounds
    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;
    
    setSelectedDate(newDate);
    onChange(newDate);
    setIsOpen(false);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth);
    
    // Empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 w-10" />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const disabled = isDateDisabled(day);
      const today = isToday(day);
      const selected = isSelected(day);
      
      days.push(
        <button
          key={day}
          onClick={() => !disabled && handleDateClick(day)}
          disabled={disabled}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-all
            ${disabled 
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer'
            }
            ${today && !selected 
              ? 'bg-slate-100 dark:bg-slate-800 text-brand font-bold' 
              : ''
            }
            ${selected 
              ? 'bg-brand text-white hover:bg-orange-600' 
              : 'text-slate-700 dark:text-slate-300'
            }
          `}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-xl text-left transition-all
          ${disabled 
            ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-50' 
            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
          }
          border border-slate-200 dark:border-slate-700
          focus:outline-none focus:ring-2 focus:ring-brand/50
        `}
      >
        <div className="flex items-center justify-between">
          <span className={selectedDate ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
          <svg 
            className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleMonthChange('prev')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="font-bold text-slate-900 dark:text-white">
                {months[currentMonth.getMonth()]}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {currentMonth.getFullYear()}
              </div>
            </div>
            
            <button
              onClick={() => handleMonthChange('next')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-10 w-10 flex items-center justify-center text-xs font-bold text-slate-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>

          {/* Today Button */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCurrentMonth(today);
                onChange(today);
                setIsOpen(false);
              }}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
