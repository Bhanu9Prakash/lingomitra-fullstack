import { useState } from 'react';
import { useCompletedLessons } from '@/hooks/use-completed-lessons';

export function LessonDebugMenu() {
  const { completedLessons, resetCompletedLessons } = useCompletedLessons();
  const [isVisible, setIsVisible] = useState(false);

  // Only render in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '14px',
        maxWidth: '300px'
      }}
    >
      <button 
        onClick={() => setIsVisible(!isVisible)}
        style={{
          padding: '4px 8px',
          backgroundColor: '#ff6600',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          marginBottom: isVisible ? '10px' : '0',
        }}
      >
        {isVisible ? 'Hide Debug Info' : 'Show Debug Info'}
      </button>
      
      {isVisible && (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>Completed Lessons:</h4>
            {completedLessons.length === 0 ? (
              <p>No completed lessons</p>
            ) : (
              <ul style={{ margin: '0', paddingLeft: '20px' }}>
                {completedLessons.map(lessonId => (
                  <li key={lessonId}>{lessonId}</li>
                ))}
              </ul>
            )}
          </div>
          
          <button
            onClick={() => {
              resetCompletedLessons();
              console.log('All completed lessons have been reset');
            }}
            style={{
              padding: '4px 8px',
              backgroundColor: '#cc0000',
              color: 'white',
              border: 'none',
              borderRadius: '3px'
            }}
          >
            Reset All Completed Lessons
          </button>
        </div>
      )}
    </div>
  );
}