import type { TaskComment } from '@/entities/task';
import type { CommentAuthor } from '../../model/types/comment';
import { CommentItem } from './CommentItem';
import styles from './CommentList.module.css';

interface CommentListProps {
  comments: readonly TaskComment[];
  author: CommentAuthor;
  onLongPress: (comment: TaskComment) => void;
}

export function CommentList({ comments, author, onLongPress }: CommentListProps) {
  return (
    <ul className={styles.list} aria-label="Коментарі">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} author={author} onLongPress={onLongPress} />
      ))}
    </ul>
  );
}