"use client";

import { Share2, MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareToWhatsapp = () => {
    const text = encodeURIComponent(`${title}\n\nBaca selengkapnya di: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(title);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
        url
      )}`,
      "_blank"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 py-3 border-y border-slate-200 my-6">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-2">
        <Share2 className="h-3.5 w-3.5" />
        Bagikan:
      </span>

      <Button
        type="button"
        size="sm"
        onClick={shareToWhatsapp}
        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 rounded-full flex items-center gap-1"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span>WhatsApp</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={shareToTwitter}
        className="h-8 text-xs px-3 rounded-full hover:bg-slate-100"
      >
        <span>X / Twitter</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={shareToFacebook}
        className="h-8 text-xs px-3 rounded-full hover:bg-slate-100"
      >
        <span>Facebook</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-8 text-xs px-2.5 rounded-full ml-auto text-slate-600"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600 mr-1" />
            <span className="text-emerald-600 font-medium">Tersalin!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 mr-1" />
            <span>Salin Link</span>
          </>
        )}
      </Button>
    </div>
  );
}
