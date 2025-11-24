declare module 'dompurify' {
  const DOMPurify: {
    sanitize: (input: string, options?: unknown) => string;
  };
  export default DOMPurify;
}
