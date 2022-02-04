export const MimeTyeps = {
  mp4: 'video/mp4',
  mov: 'video/mp4',
  m4v: 'video/mp4',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m3u8: 'application/x-mpegURL',
};

export const getMediaExtension = (url) => {
  if (typeof url === 'string') {
    const urlSplit = url.split('.');

    if (urlSplit) {
      return urlSplit.pop().toLowerCase();
    }
  }
  return '';
};

export const getMimetype = (src = '') => {
  const ext = getMediaExtension(src);
  return MimeTyeps[ext] || '';
};
