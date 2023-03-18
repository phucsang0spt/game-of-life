export function genId(length = 12) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function msToTimer(_ms: number) {
  const ms = _ms / 1000;
  const hours = Math.floor(ms / 3600);
  let remainSeconds = ms - hours * 3600;
  const minutes = Math.floor(remainSeconds / 60);
  remainSeconds = remainSeconds - minutes * 60;

  return `${padL(hours)}:${padL(minutes)}:${padL(Math.round(remainSeconds))}`;
}

export function padL(a: number, b = 2) {
  //string/number,length=2
  return (new Array(b || 2).join("0") + a).slice(-b);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export async function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res) => {
    const image = new Image();
    image.onload = () => {
      res(image);
    };
    image.src = src;
  });
}

export function debounce<Args extends any[] = any[]>(
  func: (...args: Args) => void,
  timeout = 300
) {
  let timer: NodeJS.Timeout;
  return (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}
