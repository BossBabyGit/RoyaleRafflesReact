import React from 'react'

export default function ShareModal({ shareText, url, onClose, onShared }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(shareText)

  const handleShare = async (platform) => {
    let shareUrl = ''
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        break
      case 'instagram':
        shareUrl = `https://www.instagram.com/?url=${encodedUrl}`
        break
      default:
        break
    }
    if (shareUrl) {
      window.open(shareUrl, '_blank')
      try {
        await onShared?.()
      } finally {
        onClose()
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">Share to claim free entry</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => handleShare('twitter')} className="px-4 py-2 rounded-xl bg-blue-light text-black hover:bg-blue-400">X (Twitter)</button>
          <button onClick={() => handleShare('facebook')} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Facebook</button>
          <button onClick={() => handleShare('instagram')} className="px-4 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600">Instagram</button>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">Cancel</button>
        </div>
      </div>
    </div>
  )
}
