import { Component } from '../../core/Component';
import { hslToHex, hslToRgb, parseColor } from '../../utils/color';
import './ColorPicker.css';

// EyeDropper API type declaration
declare global {
  interface Window {
    EyeDropper?: new () => {
      open: () => Promise<{ sRGBHex: string }>;
    };
  }
}

export interface ColorPickerProps {
  /** Initial color value (HEX format) */
  defaultColor?: string;
  /** Callback when color changes */
  onChange?: (color: string) => void;
  /** Show/hide pipette button (only works if browser supports EyeDropper API) */
  showPipette?: boolean;
  /** Show randomize button */
  showRandomize?: boolean;
  /** Show reset to default button */
  showReset?: boolean;
  /** Show copy to opposite theme button */
  showCopyToOpposite?: boolean;
  /** Show opacity slider */
  showOpacity?: boolean;
  /** Popup direction */
  popupDirection?: 'auto' | 'up' | 'down';
  /** Callback when copy to opposite theme is requested */
  onCopyToOpposite?: (color: string) => void;
}

type ColorFormat = 'hex' | 'rgb' | 'hsl';

export class ColorPicker extends Component<ColorPickerProps> {
  private ctx: CanvasRenderingContext2D | null = null;
  private isOpen = false;
  private isDragging = false;
  private currentHue = 30;
  private currentSaturation = 100;
  private currentLightness = 50;
  private currentOpacity = 100;
  private currentFormat: ColorFormat = 'hex';

  // Store default color for reset feature
  private defaultHue = 30;
  private defaultSaturation = 100;
  private defaultLightness = 50;
  private defaultOpacity = 100;

  // DOM references
  private trigger: HTMLButtonElement | null = null;
  private popup: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private cursor: HTMLElement | null = null;
  private preview: HTMLElement | null = null;
  private brightnessSlider: HTMLInputElement | null = null;
  private opacitySlider: HTMLInputElement | null = null;
  private formatToggle: HTMLButtonElement | null = null;
  private valueInput: HTMLInputElement | null = null;
  private pipetteBtn: HTMLButtonElement | null = null;
  private randomizeBtn: HTMLButtonElement | null = null;
  private resetBtn: HTMLButtonElement | null = null;
  private copyOppositeBtn: HTMLButtonElement | null = null;

  constructor(props: ColorPickerProps = {}) {
    super(props);
    // Parse initial color
    const parsed = parseColor(props.defaultColor || '#ff9500');
    if (parsed) {
      this.currentHue = parsed.h;
      this.currentSaturation = parsed.s;
      this.currentLightness = parsed.l;
      // Store as default
      this.defaultHue = parsed.h;
      this.defaultSaturation = parsed.s;
      this.defaultLightness = parsed.l;
    }
  }

  render(): string {
    const {
      defaultColor = '#ff9500',
      popupDirection = 'auto',
      showRandomize = true,
      showReset = true,
      showCopyToOpposite = true,
      showOpacity = true,
    } = this.props;
    const popupClass =
      popupDirection === 'down'
        ? 'kwami-colorpicker-popup-down'
        : popupDirection === 'auto'
          ? 'kwami-colorpicker-popup-auto'
          : '';
    const hasActions =
      showRandomize || showReset || showCopyToOpposite || this.props.showPipette !== false;

    return `
   <div class="kwami-colorpicker" data-kwami-id="${this.id}" data-color="${defaultColor}">
    <button class="kwami-colorpicker-trigger" aria-label="Pick a color" title="Pick a color">
     <span class="kwami-colorpicker-preview" style="background-color: ${defaultColor}"></span>
     <iconify-icon icon="solar:palette-linear" width="16" height="16"></iconify-icon>
    </button>
    <div class="kwami-colorpicker-popup ${popupClass}">
     <div class="kwami-colorpicker-wheel">
      <canvas class="kwami-colorpicker-canvas" width="200" height="200"></canvas>
      <div class="kwami-colorpicker-cursor"></div>
     </div>
     <div class="kwami-colorpicker-sliders">
      <div class="kwami-colorpicker-slider-row">
       <iconify-icon icon="solar:sun-linear" width="14" height="14"></iconify-icon>
       <input type="range" class="kwami-colorpicker-brightness-slider" min="0" max="100" value="${this.currentLightness}" />
       <iconify-icon icon="solar:moon-linear" width="14" height="14"></iconify-icon>
      </div>
      ${
        showOpacity
          ? `
                            <div class="kwami-colorpicker-slider-row">
                                <iconify-icon icon="solar:eye-linear" width="14" height="14"></iconify-icon>
                                <input type="range" class="kwami-colorpicker-opacity-slider" min="0" max="100" value="${this.currentOpacity}" />
                                <iconify-icon icon="solar:eye-closed-linear" width="14" height="14"></iconify-icon>
                            </div>
                        `
          : ''
      }
     </div>
     <div class="kwami-colorpicker-value-row">
      <button class="kwami-colorpicker-format-toggle" data-format="hex" title="Toggle format">HEX</button>
      <input type="text" class="kwami-colorpicker-value-input" value="${defaultColor}" spellcheck="false" />
     </div>
     ${
       hasActions
         ? `
                        <div class="kwami-colorpicker-actions">
                            ${
                              showRandomize
                                ? `
        <div class="kwami-colorpicker-action-item">
         <button class="kwami-colorpicker-randomize" aria-label="Randomize color" title="Randomize color">
          <iconify-icon icon="solar:shuffle-linear" width="14" height="14"></iconify-icon>
         </button>
         <span class="kwami-colorpicker-action-label">Random</span>
        </div>
                            `
                                : ''
                            }
                            <div class="kwami-colorpicker-action-item">
                                <button class="kwami-colorpicker-pipette" aria-label="Pick from screen" title="Pick color from screen">
                                    <iconify-icon icon="solar:pipette-linear" width="14" height="14"></iconify-icon>
                                </button>
                                <span class="kwami-colorpicker-action-label">Pick</span>
                            </div>
                            ${
                              showReset
                                ? `
        <div class="kwami-colorpicker-action-item">
         <button class="kwami-colorpicker-reset" aria-label="Reset to default" title="Reset to default color">
          <iconify-icon icon="solar:restart-linear" width="14" height="14"></iconify-icon>
         </button>
         <span class="kwami-colorpicker-action-label">Reset</span>
        </div>
                            `
                                : ''
                            }
                            ${
                              showCopyToOpposite
                                ? `
        <div class="kwami-colorpicker-action-item">
         <button class="kwami-colorpicker-copy-opposite" aria-label="Use for both themes" title="Use this color for both light and dark themes">
          <iconify-icon icon="solar:link-linear" width="14" height="14"></iconify-icon>
         </button>
         <span class="kwami-colorpicker-action-label">Both</span>
        </div>
                            `
                                : ''
                            }
                        </div>
                    `
         : ''
     }
    </div>
   </div>
        `;
  }

  protected onHydrate(): void {
    if (!this.element) return;

    // Get DOM references
    this.trigger = this.element.querySelector('.kwami-colorpicker-trigger');
    this.popup = this.element.querySelector('.kwami-colorpicker-popup');
    this.canvas = this.element.querySelector('.kwami-colorpicker-canvas');
    this.cursor = this.element.querySelector('.kwami-colorpicker-cursor');
    this.preview = this.element.querySelector('.kwami-colorpicker-preview');
    this.brightnessSlider = this.element.querySelector('.kwami-colorpicker-brightness-slider');
    this.opacitySlider = this.element.querySelector('.kwami-colorpicker-opacity-slider');
    this.formatToggle = this.element.querySelector('.kwami-colorpicker-format-toggle');
    this.valueInput = this.element.querySelector('.kwami-colorpicker-value-input');
    this.pipetteBtn = this.element.querySelector('.kwami-colorpicker-pipette');
    this.randomizeBtn = this.element.querySelector('.kwami-colorpicker-randomize');
    this.resetBtn = this.element.querySelector('.kwami-colorpicker-reset');
    this.copyOppositeBtn = this.element.querySelector('.kwami-colorpicker-copy-opposite');

    if (
      !this.trigger ||
      !this.popup ||
      !this.canvas ||
      !this.cursor ||
      !this.preview ||
      !this.brightnessSlider ||
      !this.formatToggle ||
      !this.valueInput
    )
      return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    // Hide pipette if not supported
    if (this.pipetteBtn && (!window.EyeDropper || this.props.showPipette === false)) {
      this.pipetteBtn.parentElement?.remove();
    }

    // Draw initial wheel
    this.drawWheel();

    // Show cursor at initial position
    this.updateCursorPosition();

    // Setup event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (
      !this.trigger ||
      !this.canvas ||
      !this.brightnessSlider ||
      !this.formatToggle ||
      !this.valueInput ||
      !this.popup
    )
      return;

    // Toggle popup
    this.addListener(this.trigger, 'click', (e) => {
      e.stopPropagation();
      this.togglePopup();
    });

    // Canvas interactions
    this.addListener(this.canvas, 'mousedown', (e) => {
      this.isDragging = true;
      this.updateFromWheel(e as MouseEvent);
    });

    this.addListener(this.canvas, 'mousemove', (e) => {
      if (this.isDragging) this.updateFromWheel(e as MouseEvent);
    });

    // Global mouseup
    const mouseUpHandler = () => {
      this.isDragging = false;
    };
    document.addEventListener('mouseup', mouseUpHandler);

    // Touch support
    this.addListener(this.canvas, 'touchstart', (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.updateFromWheel((e as TouchEvent).touches[0]);
    });

    this.addListener(this.canvas, 'touchmove', (e) => {
      e.preventDefault();
      if (this.isDragging) this.updateFromWheel((e as TouchEvent).touches[0]);
    });

    this.addListener(this.canvas, 'touchend', () => {
      this.isDragging = false;
    });

    // Brightness slider
    this.addListener(this.brightnessSlider, 'input', () => {
      this.currentLightness = parseInt(this.brightnessSlider!.value);
      this.drawWheel();
      this.updateFinalColor();
    });

    // Opacity slider
    if (this.opacitySlider) {
      this.addListener(this.opacitySlider, 'input', () => {
        this.currentOpacity = parseInt(this.opacitySlider!.value);
        this.updateFinalColor();
      });
    }

    // Format toggle
    this.addListener(this.formatToggle, 'click', (e) => {
      e.stopPropagation();
      this.cycleFormat();
    });

    // Pipette / EyeDropper
    if (this.pipetteBtn) {
      this.addListener(this.pipetteBtn, 'click', (e) => {
        e.stopPropagation();
        this.pickFromScreen();
      });
    }

    // Randomize button
    if (this.randomizeBtn) {
      this.addListener(this.randomizeBtn, 'click', (e) => {
        e.stopPropagation();
        this.randomizeColor();
      });
    }

    // Reset button - simple reset to default
    if (this.resetBtn) {
      this.addListener(this.resetBtn, 'click', (e) => {
        e.stopPropagation();
        this.resetToDefault();
      });
    }

    // Copy to opposite theme button
    if (this.copyOppositeBtn) {
      this.addListener(this.copyOppositeBtn, 'click', (e) => {
        e.stopPropagation();
        this.copyToOppositeTheme();
      });
    }

    // Value input
    this.addListener(this.valueInput, 'input', () => {
      this.handleInputChange();
    });

    this.addListener(this.valueInput, 'blur', () => {
      this.valueInput!.value = this.getColorString();
    });

    this.addListener(this.valueInput, 'keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') {
        this.valueInput!.blur();
      }
    });

    // Close on outside click
    const outsideClickHandler = (e: Event) => {
      if (this.isOpen && !this.element?.contains(e.target as Node)) {
        this.closePopup();
      }
    };
    document.addEventListener('click', outsideClickHandler);

    // Close on ESC
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closePopup();
      }
    };
    document.addEventListener('keydown', escHandler as EventListener);
  }

  private togglePopup(): void {
    this.isOpen = !this.isOpen;

    // Calculate auto position BEFORE making visible
    if (this.isOpen) {
      this.updateAutoPosition();
    }

    this.popup?.classList.toggle('active', this.isOpen);
    this.element?.classList.toggle('active', this.isOpen);

    // Update cursor position when opening
    if (this.isOpen) {
      this.updateCursorPosition();
    }
  }

  private updateAutoPosition(): void {
    const { popupDirection = 'auto' } = this.props;
    if (popupDirection !== 'auto' || !this.popup || !this.element) return;

    // Check if popup has fixed positioning from parent CSS (e.g., in configurators)
    const computedStyle = window.getComputedStyle(this.popup);
    const hasFixedPosition = computedStyle.position === 'fixed';

    // If position is fixed (likely from parent container CSS), skip auto-positioning
    if (hasFixedPosition) return;

    // Temporarily make popup visible to measure it
    const wasVisible = this.popup.classList.contains('active');
    if (!wasVisible) {
      this.popup.style.visibility = 'hidden';
      this.popup.style.opacity = '1';
      this.popup.style.display = 'block';
    }

    // Get viewport height and element position
    const viewportHeight = window.innerHeight;
    const rect = this.element.getBoundingClientRect();
    const popupHeight = this.popup.offsetHeight || 400;

    // Restore visibility state
    if (!wasVisible) {
      this.popup.style.visibility = '';
      this.popup.style.opacity = '';
      this.popup.style.display = '';
    }

    // Calculate space above and below
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;

    // Decide direction based on available space
    if (spaceBelow >= popupHeight + 20 || spaceBelow > spaceAbove) {
      // Open downward
      this.popup.style.bottom = 'auto';
      this.popup.style.top = 'calc(100% + 12px)';
      this.popup.classList.add('kwami-colorpicker-popup-down');
    } else {
      // Open upward
      this.popup.style.bottom = 'calc(100% + 12px)';
      this.popup.style.top = 'auto';
      this.popup.classList.remove('kwami-colorpicker-popup-down');
    }
  }

  private closePopup(): void {
    this.isOpen = false;
    this.popup?.classList.remove('active');
    this.element?.classList.remove('active');
  }

  private drawWheel(): void {
    if (!this.ctx || !this.canvas) return;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 5;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let angle = 0; angle < 360; angle++) {
      const startAngle = ((angle - 1) * Math.PI) / 180;
      const endAngle = ((angle + 1) * Math.PI) / 180;

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.closePath();

      const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, `hsl(${angle}, 0%, ${this.currentLightness}%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, ${this.currentLightness}%)`);

      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }
  }

  private updateFromWheel(e: MouseEvent | Touch): void {
    if (!this.canvas || !this.cursor) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 5;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      this.cursor.style.left = `${x / scaleX}px`;
      this.cursor.style.top = `${y / scaleY}px`;
      this.cursor.style.opacity = '1';

      let hue = Math.atan2(dy, dx) * (180 / Math.PI);
      if (hue < 0) hue += 360;

      this.currentHue = hue;
      this.currentSaturation = Math.min((distance / radius) * 100, 100);

      this.updateFinalColor();
    }
  }

  private updateCursorPosition(): void {
    if (!this.canvas || !this.cursor) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 5;

    const angle = this.currentHue * (Math.PI / 180);
    const distance = (this.currentSaturation / 100) * radius;

    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    // Convert canvas coordinates to display coordinates
    this.cursor.style.left = `${x / scaleX}px`;
    this.cursor.style.top = `${y / scaleY}px`;
    this.cursor.style.opacity = '1';

    // Update cursor background color
    const hexColor = hslToHex(this.currentHue, this.currentSaturation, this.currentLightness);
    this.cursor.style.backgroundColor = hexColor;
  }

  private getColorString(): string {
    const rgb = hslToRgb(this.currentHue, this.currentSaturation, this.currentLightness);
    const alpha = this.currentOpacity / 100;

    switch (this.currentFormat) {
      case 'hex':
        if (this.currentOpacity < 100) {
          const alphaHex = Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0');
          return (
            hslToHex(this.currentHue, this.currentSaturation, this.currentLightness) + alphaHex
          ).toUpperCase();
        }
        return hslToHex(
          this.currentHue,
          this.currentSaturation,
          this.currentLightness
        ).toUpperCase();
      case 'rgb':
        if (this.currentOpacity < 100) {
          return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;
        }
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case 'hsl':
        if (this.currentOpacity < 100) {
          return `hsla(${Math.round(this.currentHue)}, ${Math.round(this.currentSaturation)}%, ${Math.round(this.currentLightness)}%, ${alpha.toFixed(2)})`;
        }
        return `hsl(${Math.round(this.currentHue)}, ${Math.round(this.currentSaturation)}%, ${Math.round(this.currentLightness)}%)`;
    }
  }

  private updateFinalColor(updateInput = true): void {
    const hexColor = hslToHex(this.currentHue, this.currentSaturation, this.currentLightness);
    const alpha = this.currentOpacity / 100;

    if (this.preview) {
      if (this.currentOpacity < 100) {
        const rgb = hslToRgb(this.currentHue, this.currentSaturation, this.currentLightness);
        this.preview.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
      } else {
        this.preview.style.backgroundColor = hexColor;
      }
    }
    this.element?.setAttribute('data-color', hexColor);

    if (updateInput && this.valueInput) {
      this.valueInput.value = this.getColorString();
    }

    // Update cursor position and color
    this.updateCursorPosition();

    // Dispatch custom event
    this.element?.dispatchEvent(
      new CustomEvent('colorchange', {
        detail: { color: hexColor, opacity: this.currentOpacity },
        bubbles: true,
      })
    );

    // Call onChange callback
    if (this.props.onChange) {
      this.props.onChange(hexColor);
    }
  }

  private handleInputChange(): void {
    if (!this.valueInput) return;

    const parsed = parseColor(this.valueInput.value);
    if (parsed) {
      this.currentHue = parsed.h;
      this.currentSaturation = parsed.s;
      this.currentLightness = parsed.l;

      if (this.brightnessSlider) {
        this.brightnessSlider.value = String(this.currentLightness);
      }
      this.drawWheel();
      this.updateCursorPosition();
      this.updateFinalColor(false);
    }
  }

  private cycleFormat(): void {
    const formats: ColorFormat[] = ['hex', 'rgb', 'hsl'];
    const currentIndex = formats.indexOf(this.currentFormat);
    this.currentFormat = formats[(currentIndex + 1) % formats.length];

    if (this.formatToggle) {
      this.formatToggle.textContent = this.currentFormat.toUpperCase();
      this.formatToggle.setAttribute('data-format', this.currentFormat);
    }
    if (this.valueInput) {
      this.valueInput.value = this.getColorString();
    }
  }

  private async pickFromScreen(): Promise<void> {
    if (!window.EyeDropper || !this.pipetteBtn || !this.popup) return;

    try {
      const eyeDropper = new window.EyeDropper();
      this.pipetteBtn.classList.add('clicked');
      setTimeout(() => this.pipetteBtn?.classList.remove('clicked'), 200);

      this.popup.classList.remove('active');
      this.element?.classList.remove('active');

      const result = await eyeDropper.open();
      const color = result.sRGBHex;

      this.popup.classList.add('active');
      this.element?.classList.add('active');

      const parsed = parseColor(color);
      if (parsed) {
        this.currentHue = parsed.h;
        this.currentSaturation = parsed.s;
        this.currentLightness = parsed.l;

        if (this.brightnessSlider) {
          this.brightnessSlider.value = String(this.currentLightness);
        }
        this.drawWheel();
        this.updateCursorPosition();
        this.updateFinalColor();
      }
    } catch {
      this.popup.classList.add('active');
      this.element?.classList.add('active');
    }
  }

  /** Randomize the color */
  private randomizeColor(): void {
    this.currentHue = Math.random() * 360;
    this.currentSaturation = 50 + Math.random() * 50; // 50-100% saturation
    this.currentLightness = 30 + Math.random() * 40; // 30-70% lightness

    if (this.brightnessSlider) {
      this.brightnessSlider.value = String(this.currentLightness);
    }
    this.drawWheel();
    this.updateCursorPosition();
    this.updateFinalColor();

    // Animate the button
    this.randomizeBtn?.classList.add('clicked');
    setTimeout(() => this.randomizeBtn?.classList.remove('clicked'), 200);
  }

  /** Reset to default color (simple button, not toggle) */
  private resetToDefault(): void {
    this.currentHue = this.defaultHue;
    this.currentSaturation = this.defaultSaturation;
    this.currentLightness = this.defaultLightness;
    this.currentOpacity = this.defaultOpacity;

    if (this.brightnessSlider) {
      this.brightnessSlider.value = String(this.currentLightness);
    }
    if (this.opacitySlider) {
      this.opacitySlider.value = String(this.currentOpacity);
    }
    this.drawWheel();
    this.updateCursorPosition();
    this.updateFinalColor();

    // Animate the button
    this.resetBtn?.classList.add('clicked');
    setTimeout(() => this.resetBtn?.classList.remove('clicked'), 200);
  }

  /** Copy current color to opposite theme */
  private copyToOppositeTheme(): void {
    const hexColor = hslToHex(this.currentHue, this.currentSaturation, this.currentLightness);

    // Animate the button
    this.copyOppositeBtn?.classList.add('clicked');
    setTimeout(() => this.copyOppositeBtn?.classList.remove('clicked'), 200);

    // Dispatch custom event
    this.element?.dispatchEvent(
      new CustomEvent('copytoopposite', {
        detail: { color: hexColor },
        bubbles: true,
      })
    );

    // Call callback
    if (this.props.onCopyToOpposite) {
      this.props.onCopyToOpposite(hexColor);
    }
  }

  /** Get the current color value */
  getColor(): string {
    return hslToHex(this.currentHue, this.currentSaturation, this.currentLightness);
  }

  /** Set the color programmatically */
  setColor(color: string): void {
    const parsed = parseColor(color);
    if (parsed) {
      this.currentHue = parsed.h;
      this.currentSaturation = parsed.s;
      this.currentLightness = parsed.l;

      if (this.brightnessSlider) {
        this.brightnessSlider.value = String(this.currentLightness);
      }
      this.drawWheel();
      this.updateCursorPosition();
      this.updateFinalColor();
    }
  }

  /** Set the default color for reset feature */
  setDefaultColor(color: string): void {
    const parsed = parseColor(color);
    if (parsed) {
      this.defaultHue = parsed.h;
      this.defaultSaturation = parsed.s;
      this.defaultLightness = parsed.l;
    }
  }
}
