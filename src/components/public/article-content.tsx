import React from "react";

interface ArticleContentProps {
  content: any;
}

export function ArticleContent({ content }: ArticleContentProps) {
  if (!content) {
    return (
      <p className="text-slate-500 italic">Isi berita belum tersedia.</p>
    );
  }

  // Jika content berupa string HTML
  if (typeof content === "string") {
    return (
      <div
        className="prose prose-slate lg:prose-lg max-w-none text-slate-800 leading-relaxed font-serif"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Jika content adalah JSON dari Tiptap
  if (content && content.type === "doc" && Array.isArray(content.content)) {
    return (
      <div className="space-y-5 text-slate-800 text-lg leading-relaxed font-serif">
        {content.content.map((node: any, index: number) => {
          // Paragraf
          if (node.type === "paragraph") {
            if (!node.content) return <div key={index} className="h-4" />;
            return (
              <p key={index} className="leading-relaxed">
                {renderNodeChildren(node.content)}
              </p>
            );
          }

          // Heading 2
          if (node.type === "heading" && node.attrs?.level === 2) {
            return (
              <h2
                key={index}
                className="text-2xl font-bold font-sans text-slate-950 mt-8 mb-3 pt-2"
              >
                {renderNodeChildren(node.content)}
              </h2>
            );
          }

          // Heading 3
          if (node.type === "heading" && node.attrs?.level === 3) {
            return (
              <h3
                key={index}
                className="text-xl font-bold font-sans text-slate-900 mt-6 mb-2"
              >
                {renderNodeChildren(node.content)}
              </h3>
            );
          }

          // Blockquote (Kutipan Narasumber)
          if (node.type === "blockquote") {
            return (
              <blockquote
                key={index}
                className="border-l-4 border-blue-600 pl-4 py-2 italic text-slate-700 bg-slate-50 rounded-r-lg my-6"
              >
                {node.content?.map((innerNode: any, idx: number) => (
                  <p key={idx}>{renderNodeChildren(innerNode.content)}</p>
                ))}
              </blockquote>
            );
          }

          // Bullet List
          if (node.type === "bulletList") {
            return (
              <ul key={index} className="list-disc list-inside space-y-1.5 my-4">
                {node.content?.map((item: any, idx: number) => (
                  <li key={idx}>{renderNodeChildren(item.content?.[0]?.content)}</li>
                ))}
              </ul>
            );
          }

          // Ordered List
          if (node.type === "orderedList") {
            return (
              <ol key={index} className="list-decimal list-inside space-y-1.5 my-4">
                {node.content?.map((item: any, idx: number) => (
                  <li key={idx}>{renderNodeChildren(item.content?.[0]?.content)}</li>
                ))}
              </ol>
            );
          }

          // Image embedded
          if (node.type === "image") {
            return (
              <figure key={index} className="my-6">
                <img
                  src={node.attrs?.src}
                  alt={node.attrs?.alt || "Foto Liputan"}
                  className="rounded-xl w-full max-h-[500px] object-cover"
                />
                {node.attrs?.title && (
                  <figcaption className="text-center text-xs text-slate-500 mt-2 font-sans">
                    {node.attrs.title}
                  </figcaption>
                )}
              </figure>
            );
          }

          return null;
        })}
      </div>
    );
  }

  return (
    <div className="text-slate-800 leading-relaxed font-serif">
      {JSON.stringify(content)}
    </div>
  );
}

function renderNodeChildren(nodes: any[]): React.ReactNode {
  if (!nodes || !Array.isArray(nodes)) return null;

  return nodes.map((node, i) => {
    let text: React.ReactNode = node.text || "";

    if (node.marks) {
      node.marks.forEach((mark: any) => {
        if (mark.type === "bold") {
          text = <strong key={`b-${i}`}>{text}</strong>;
        } else if (mark.type === "italic") {
          text = <em key={`i-${i}`}>{text}</em>;
        } else if (mark.type === "link") {
          text = (
            <a
              key={`a-${i}`}
              href={mark.attrs?.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline font-medium hover:text-blue-800"
            >
              {text}
            </a>
          );
        }
      });
    }

    return <React.Fragment key={i}>{text}</React.Fragment>;
  });
}
