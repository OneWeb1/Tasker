import type { TaskComment } from '@/entities/task';
import { useLongPress } from '@/shared/lib/hooks/useLongPress';
import { formatCommentTime } from '../../model/lib/formatCommentTime';
import type { CommentAuthor } from '../../model/types/comment';
import styles from './CommentList.module.css';

interface CommentItemProps {
  comment: TaskComment;
  author: CommentAuthor;
  onLongPress: (comment: TaskComment) => void;
}

export function CommentItem({ comment, author, onLongPress }: CommentItemProps) {
  const pressHandlers = useLongPress({ onLongPress: () => onLongPress(comment) });

  return (
    <li className={styles.item} {...pressHandlers}>
      <span className={styles.avatar}>{author.avatar}</span>
      <div className={styles.content}>
        <p className={styles.meta}>
          <span className={styles.name}>{author.name}</span>
          <time className={styles.time} dateTime={new Date(comment.createdAt).toISOString()}>
            {formatCommentTime(comment.createdAt)}
          </time>
        </p>
        <p className={styles.text}>{comment.text}</p>
      </div>
    </li>
  );
}