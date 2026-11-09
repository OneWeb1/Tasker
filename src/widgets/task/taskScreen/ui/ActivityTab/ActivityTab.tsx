import { useEffect, useRef } from 'react';
import type { Task } from '@/entities/task';
import {
  CommentActionsSheet,
  CommentComposer,
  CommentList,
  useCommentActions,
  useComments,
} from '@/features/task/comments';
import { UserAvatar, useSettings } from '@/features/settings/managePreferences';
import { useActivityFeed } from '../../model/hooks/useActivityFeed';
import { TaskHistory } from '../TaskHistory';
import styles from './ActivityTab.module.css';

const DEFAULT_AUTHOR_NAME = 'Ви';
const AVATAR_SIZE = 40;

interface ActivityTabProps {
  task: Task;
}

export function ActivityTab({ task }: ActivityTabProps) {
  const { userName } = useSettings();
  const { comments, addComment, editComment, deleteComment } = useComments(task);
  const commentActions = useCommentActions({ editComment, deleteComment });
  const feed = useActivityFeed(task, comments);
  const previousCommentCount = useRef(comments.length);

  useEffect(() => {
    const isAdded = comments.length > previousCommentCount.current;
    previousCommentCount.current = comments.length;
    if (!isAdded) return;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        const root = document.documentElement;
        window.scrollTo({ top: root.scrollHeight - root.clientHeight, behavior: 'smooth' });
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [comments.length]);

  const author = {
    name: userName || DEFAULT_AUTHOR_NAME,
    avatar: <UserAvatar size={AVATAR_SIZE} />,
  };

  return (
    <div className={styles.tab}>
      <div className={styles.feed}>
        {feed.map((block) =>
          block.kind === 'history' ? (
            <TaskHistory key={block.id} items={block.items} />
          ) : (
            <CommentList
              key={block.id}
              comments={block.comments}
              author={author}
              onLongPress={commentActions.open}
            />
          ),
        )}
      </div>
      <CommentComposer
        onSubmit={commentActions.editingText === null ? addComment : commentActions.saveEdit}
        editingText={commentActions.editingText}
        onCancelEdit={commentActions.cancelEdit}
      />
      <CommentActionsSheet {...commentActions.sheet} />
    </div>
  );
}