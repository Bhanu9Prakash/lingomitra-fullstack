import { useState } from 'react';
import { useCompletedLessons } from '@/hooks/use-completed-lessons';
import { useRoute } from 'wouter';

export function LessonDebugMenu() {
  const { completedLessons, resetCompletedLessons, markLessonCompleted, markLessonNotCompleted } = useCompletedLessons();
  const [isVisible, setIsVisible] = useState(false);
  const [manualLessonId, setManualLessonId] = useState('');
  
  // Get the current lesson ID from the URL if possible
  const [matchStandardRoute, paramsStandardRoute] = useRoute("/:language/lesson/:lessonNumber");
  let currentLessonId = '';
  
  if (paramsStandardRoute?.language && paramsStandardRoute?.lessonNumber) {
    const padded = paramsStandardRoute.lessonNumber.padStart(2, '0');
    currentLessonId = `${paramsStandardRoute.language}-lesson${padded}`;
  }

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
        maxWidth: '350px'
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
        {isVisible ? 'Hide Debug Panel' : 'Show Debug Panel'}
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
                  <li key={lessonId} style={{ marginBottom: '3px' }}>
                    {lessonId}
                    <button
                      onClick={() => markLessonNotCompleted(lessonId)}
                      style={{
                        marginLeft: '10px',
                        padding: '1px 4px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '10px'
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Current lesson actions */}
          {currentLessonId && (
            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0' }}>Current Lesson:</h4>
              <p style={{ margin: '0 0 5px 0' }}>{currentLessonId}</p>
              <button
                onClick={() => {
                  markLessonCompleted(currentLessonId);
                  console.log(`Manually completed lesson ${currentLessonId}`);
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  marginRight: '5px'
                }}
              >
                Mark Completed
              </button>
              <button
                onClick={() => {
                  markLessonNotCompleted(currentLessonId);
                  console.log(`Manually uncompleted lesson ${currentLessonId}`);
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px'
                }}
              >
                Mark Not Completed
              </button>
            </div>
          )}
          
          {/* Manual lesson ID entry */}
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>Mark Any Lesson:</h4>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
              <input
                type="text"
                value={manualLessonId}
                onChange={(e) => setManualLessonId(e.target.value)}
                placeholder="e.g. es-lesson01"
                style={{
                  padding: '4px',
                  marginRight: '5px',
                  borderRadius: '3px',
                  border: '1px solid #666',
                  flex: 1
                }}
              />
              <button
                onClick={() => {
                  if (manualLessonId) {
                    markLessonCompleted(manualLessonId);
                    console.log(`Manually completed lesson ${manualLessonId}`);
                  }
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px'
                }}
              >
                Complete
              </button>
            </div>
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
              borderRadius: '3px',
              width: '100%'
            }}
          >
            Reset All Completed Lessons
          </button>
        </div>
      )}
    </div>
  );
}