/** Trigger a browser file download for text/blob content. */
export function downloadFile(
  filename: string,
  content: string | ArrayBuffer,
  mimeType: string
): void {
  const blob = new Blob(
    [typeof content === 'string' ? content : new Uint8Array(content)],
    { type: `${mimeType}${typeof content === 'string' ? ';charset=utf-8' : ''}` }
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
