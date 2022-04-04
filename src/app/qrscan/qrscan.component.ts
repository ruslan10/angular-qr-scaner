import {Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, Renderer2, ViewChild} from '@angular/core';
import jsQR from 'jsqr';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-qrscan',
  templateUrl: './qrscan.component.html',
  styleUrls: ['./qrscan.component.scss']
})
export class QrscanComponent implements OnDestroy {
  @ViewChild('qrWrapper') private qrWrapper!: ElementRef;
  @ViewChild('scanner') private scanner!: ElementRef;
  canvasContext2D!: CanvasRenderingContext2D;
  video!: HTMLVideoElement;
  scanning = false;
  scanCode: any;

  constructor(@Inject(PLATFORM_ID) private platform: Object,
              private renderer: Renderer2) {}

  createCanvas(): CanvasRenderingContext2D {
    const canvas = this.renderer.createElement('canvas');
    this.renderer.appendChild(this.qrWrapper.nativeElement, canvas);
    return canvas.getContext('2d');
  }

  scan() {
    if (isPlatformBrowser(this.platform) && 'mediaDevices' in navigator) {
      this.video = !this.video ? this.renderer.createElement('video') : this.video;
      this.scanning = true;
      this.scanCode = null;
      this.renderer.setStyle(this.qrWrapper.nativeElement, 'display', 'block');
      this.renderer.setStyle(this.scanner.nativeElement, 'display', 'block');
      navigator.mediaDevices.getUserMedia({audio: false, video: { facingMode: "environment" } })
        .then((ms: MediaStream) => {
          this.video.srcObject = ms;
          if (!this.canvasContext2D) {
            this.canvasContext2D = this.createCanvas();
            // required to tell iOS safari we don't want fullscreen
            this.video.setAttribute('playsinline', 'true');
          }
          this.video.play();
          requestAnimationFrame(this.tick);
        });
    }
  }

  tick = () => {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      try {
        const { videoHeight: height, videoWidth: width } = this.video;
        this.canvasContext2D.canvas.height = height;
        this.canvasContext2D.canvas.width = width;

        this.canvasContext2D.drawImage(this.video, 0, 0, width, height);
        const imageData = this.canvasContext2D.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });

        if (code) {
          this.scanCode = code.data;
          this.stopScan();
        }
      } catch (e) {
        console.error(e);
      }
    }

    this.scanning && requestAnimationFrame(this.tick);
  }

  stopScan() {
    this.renderer.setStyle(this.qrWrapper.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.scanner.nativeElement, 'display', 'none');
    this.scanning = false;
    this.video.pause();
    (this.video.srcObject as MediaStream)
      .getVideoTracks()[0]
      .stop();
    this.video.srcObject = null;
  }

  ngOnDestroy() {
    (this.video.srcObject as MediaStream)
      .getVideoTracks()[0]
      .stop();
  }
}
