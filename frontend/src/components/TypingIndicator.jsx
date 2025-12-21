function TypingIndicator({ visible }) {
  if (!visible) return null;

  return (
    <div className="text-xs text-zinc-400 px-2 py-1 animate-pulse">
      The Stranger is typing…
    </div>
  );
}

export default TypingIndicator;
