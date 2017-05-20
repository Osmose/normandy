import React from 'react';
import { Timeline } from 'antd';
import RevisionInfo from 'control2/components/recipes/RevisionInfo';

export default function RecipeHistory({ history, selectedRevision = null }) {
  return (
    <div className="recipe-history">
      <h2 className="heading">Revision History</h2>
      <Timeline>
        {history.map((revision, index) => (
          <RecipeHistoryItem
            key={revision.id}
            revision={revision}
            selected={selectedRevision === revision.id}
            last={
              /* Workaround to not show a line below the last element
                 due to wrapping Timeline.Item in another component. */
              index === (history.length - 1)
            }
          />
        ))}
      </Timeline>
    </div>
  );
}

export function RecipeHistoryItem({ revision, selected, ...props }) {
  let dot = null;
  if (selected) {
    dot = <i className="recipe-history-icon-selected" />;
  }

  return (
    <Timeline.Item color="grey" dot={dot} {...props}>
      <RevisionInfo revision={revision} />
    </Timeline.Item>
  );
}
