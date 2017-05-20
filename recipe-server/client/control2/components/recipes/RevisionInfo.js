import React from 'react';
import { Link } from 'react-router';
import { Popover, Tag, Tooltip } from 'antd';

export default function RevisionInfo({ revision }) {


  let statusTag = null;
  if (revision.enabled) {
    statusTag = <LiveTag />;
  } else if (revision.approval_request) {
    statusTag = <ApprovalRequestTag revision={revision} />;
  } else if (revision.is_latest) {
    // Draft status is only useful info for the latest revision.
    statusTag = <DraftTag />;
  }

  return (
    <span className="revision-info">
      <Link to={`/control2/recipe/revision/${revision.id}/`} className="hash">
        {revision.id.slice(0, 7)}
      </Link>
      {statusTag}
      {revision.is_latest && <LatestTag />}
    </span>
  );
}

export function LiveTag() {
  return (
    <Tooltip title="Live revisions are currently being sent to users.">
      <Tag color="green">Live</Tag>
    </Tooltip>
  );
}

export function DraftTag() {
  return (
    <Tooltip title="Draft revisions can be submitted for approval and published.">
      <Tag>Draft</Tag>
    </Tooltip>
  );
}

export function ArchivedTag() {
  return (
    <Tooltip title="Archived revisions can no longer be sent to users.">
      <Tag>Archived</Tag>
    </Tooltip>
  );
}

export function LatestTag() {
  return (
    <Tag color="blue">Latest</Tag>
  );
}

export function ApprovalRequestTag({ revision }) {
  const approvalRequest = revision.approval_request;

  let tag;
  if (approvalRequest.approved === null) {
    tag = <Tag color="orange">In Review</Tag>;
  } else if (approvalRequest.approved) {
    tag = (
      <span>
        <Popover
          title={`Approved by ${approvalRequest.approver.email}`}
          content={approvalRequest.comment}
        >
          <Tag color="green">Approved</Tag>
        </Popover>
        {revision.is_archived && <ArchivedTag />}
      </span>
    );
  } else {
    tag = (
      <Popover
        title={`Rejected by ${approvalRequest.approver.email}`}
        content={approvalRequest.comment}
      >
        <Tag color="red">Rejected</Tag>
      </Popover>
    );
  }

  return (
    <Link to={`/control2/recipe/revision/${revision.id}/review/`}>
      {tag}
    </Link>
  );
}
