export class Deakins {
    constructor(context, options = {}) {
        this.distance = 1000;
        this.viewport = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: 0,
            height: 0,
            scale: [1.0, 1.0]
        };
        this.flipAspectRatio = false;
        this.canvasSize = [0, 0];
        this.lookAtVector = [0, 0];
        this.context = context;
        this.fieldOfView = options.fieldOfView || Math.PI / 4.0;
        this.margin = options.margin || {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };
        this.flipAspectRatio = !!options.flipAspectRatio;
        this.resize();
        this.addListeners();
    }
    begin() {
        this.context.save();
        this.applyScale();
        this.applyTranslation();
    }
    end() {
        this.context.restore();
    }
    applyScale() {
        this.context.scale(this.viewport.scale[0], this.viewport.scale[1]);
    }
    applyTranslation() {
        this.context.translate(-this.viewport.left, -this.viewport.top);
    }
    updateViewport() {
        if (this.flipAspectRatio) {
            this.aspectRatio = this.canvasSize[1] / this.canvasSize[0];
            this.viewport.height = this.distance * Math.tan(this.fieldOfView);
            this.viewport.width = this.viewport.height / this.aspectRatio;
        }
        else {
            this.aspectRatio = this.canvasSize[0] / this.canvasSize[1];
            this.viewport.width = this.distance * Math.tan(this.fieldOfView);
            this.viewport.height = this.viewport.width / this.aspectRatio;
        }
        this.viewport.left = this.lookAtVector[0] - (this.viewport.width / 2);
        this.viewport.top = this.lookAtVector[1] - (this.viewport.height / 2);
        this.viewport.right = this.viewport.left + this.viewport.width;
        this.viewport.bottom = this.viewport.top + this.viewport.height;
        this.viewport.scale[0] = this.canvasSize[0] / this.viewport.width;
        this.viewport.scale[1] = this.canvasSize[0] / this.viewport.height;
    }
    zoomTo(z) {
        this.distance = z;
        this.updateViewport();
    }
    lookAt([x, y], lazy = false) {
        if (lazy) {
            const pointScreenSpace = this.worldToScreen([x, y]);
            const left = this.canvasSize[0] * this.margin.left;
            const right = this.canvasSize[0] - (this.canvasSize[0] * this.margin.right);
            const top = this.canvasSize[0] * this.margin.top;
            const bottom = this.canvasSize[0] - (this.canvasSize[0] * this.margin.bottom);
            if (pointScreenSpace[0] < left) {
                x = x - this.viewport.width * (this.margin.left - 0.5);
            }
            else if (pointScreenSpace[0] > right) {
                x = x - this.viewport.width * (0.5 - this.margin.right);
            }
            if (pointScreenSpace[1] < top) {
                y = y - this.viewport.height * (this.margin.top - 0.5);
            }
            else if (pointScreenSpace[1] > bottom) {
                y = y - this.viewport.height * (0.5 - this.margin.bottom);
            }
        }
        this.lookAtVector[0] = x;
        this.lookAtVector[1] = y;
        this.updateViewport();
    }
    screenToWorld(point) {
        const x = (point[0] / this.viewport.scale[0]) + this.viewport.left;
        const y = (point[1] / this.viewport.scale[1]) + this.viewport.top;
        return [x, y];
    }
    worldToScreen(point) {
        const x = (point[0] - this.viewport.left) * (this.viewport.scale[0]);
        const y = (point[1] - this.viewport.top) * (this.viewport.scale[1]);
        return [x, y];
    }
    resize() {
        this.canvasSize[0] = this.context.canvas.width;
        this.canvasSize[1] = this.context.canvas.height;
        this.updateViewport();
    }
    addListeners() {
        window.addEventListener(`wheel`, e => {
            if (e.ctrlKey) {
                let zoomLevel = this.distance - (e.deltaY * 20);
                if (zoomLevel <= 1) {
                    zoomLevel = 1;
                }
                this.zoomTo(zoomLevel);
            }
            else {
                const x = this.lookAtVector[0] + (e.deltaX * 2);
                const y = this.lookAtVector[1] + (e.deltaY * 2);
                this.lookAt([x, y]);
            }
        });
        window.addEventListener(`keydown`, e => {
            if (e.key === 'r') {
                this.zoomTo(1000);
                this.lookAt([0, 0]);
            }
        });
    }
}
;
