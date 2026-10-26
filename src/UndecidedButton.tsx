/**
 * 目前無法決定, offered under every interactive question. Pressing it only marks the draft; 確認答案 still has to confirm it,
 * and any other operation on the question clears it.
 */
export function UndecidedButton({ pressed, onPress }: { pressed: boolean; onPress: () => void }) {
  return <button type="button" className="undecided-button" aria-pressed={pressed} onClick={onPress}>目前無法決定</button>;
}
