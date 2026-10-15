const FILES = import.meta.glob<string>('../../assets/*.{svg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const ASSET_FILES = Object.entries(FILES)
  .map(([path, url]) => ({ name: path.split('/').pop() ?? path, url }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function AssetGrid() {
  return (
    <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {ASSET_FILES.map((file) => (
        <li
          key={file.name}
          className="flex flex-col gap-2 border border-ink p-3"
        >
          <img src={file.url} alt="" className="h-32 w-full object-contain" />
          <a
            href={file.url}
            download={file.name}
            className="font-mono text-legal text-ink underline"
          >
            {file.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
