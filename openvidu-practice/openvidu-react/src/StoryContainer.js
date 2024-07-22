import React from "react";

const StoryContainer = ({
  stories,
  currentStoryIndex,
  handleNextStory,
  isCreator,
}) => {
  return (
    <div id="story-container">
      <h3>사연 읽기 코너</h3>
      <div id="story-content">
        {currentStoryIndex === -1 ? (
          <p>사연읽기 코너 시작</p>
        ) : (
          <>
            <h4>{stories[currentStoryIndex].title}</h4>
            <p>{stories[currentStoryIndex].content}</p>
          </>
        )}
      </div>
      {isCreator && (
        <div>
          {currentStoryIndex < stories.length - 1 ? (
            <button onClick={handleNextStory}>다음 사연</button>
          ) : (
            <button onClick={() => {}}>종료하기</button>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryContainer;
