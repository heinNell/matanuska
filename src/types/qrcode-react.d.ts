declare module 'qrcode.react' {
  import { FC } from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    includeMargin?: boolean;
    renderAs?: 'canvas' | 'svg';
  }

  const QRCode: FC<QRCodeProps>;
  export default QRCode;
}
