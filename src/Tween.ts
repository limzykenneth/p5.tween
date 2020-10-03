namespace p5.tween {

    export class Tween {
        private obj: any
        private start: any
        private motionStart: any
        private motions = []
        private keyChanges = []
        private active = false
        private isLoop = false
        private currentMotionIndex = 0

        constructor(objStart) {
            this.obj = objStart
        }

        private resetToStart() {
            for (let key in this.start) {
                this.obj[key] = this.start[key]
            }

            this.motionStart = this.createStartObject(this.start)
        }

        private createStartObject(objStart) {
            const changes = {}
            this.keyChanges.forEach(key => changes[key] = objStart[key])
            return changes
        }

        private addToKeyChangeList(key: string) {
            if (!this.keyChanges.includes(key))
                this.keyChanges.push(key)
        }

        private interpolation(start: number, stop: number, amt: number, easing: string = 'linear'): number {
            let easingFunction = !(easing in EASINGS) ? EASINGS['linear'] : EASINGS[easing]
            return easingFunction(amt) * (stop - start) + start;
        }

        addMotion(key: string, target: number, duration: number, easing: string = 'linear'): Tween {
            this.addToKeyChangeList(key)
            this.motions.push({
                actions: [{ key, target }],
                duration,
                leftTime: 0,
                easing
            })
            return this
        }

        addMotions(actions, duration: number, easing: string = 'linear'): Tween {
            actions.flatMap(a => a.key).forEach((key: string) => this.addToKeyChangeList(key))

            this.motions.push({
                actions,
                duration,
                leftTime: 0,
                easing
            })
            return this
        }

        resetMotions() {
            this.motions = []
        }

        startLoop() {
            this.isLoop = true
            this.startTween()
        }

        startTween() {
            this.start = this.createStartObject(this.obj)
            this.motionStart = this.createStartObject(this.obj)
            this.currentMotionIndex = 0
            this.active = true
        }

        update(deltaTime: number) {
            if (!this.active) return

            const motion = this.motions[this.currentMotionIndex]

            if (motion.leftTime >= motion.duration) {
                motion.leftTime = 0
                this.motionStart = this.createStartObject(this.obj)
                this.currentMotionIndex += 1

                if (this.currentMotionIndex >= this.motions.length) {
                    if (this.isLoop) {
                        this.resetToStart()
                        this.currentMotionIndex = 0
                    } else {
                        this.active = false
                    }
                }
            }

            motion.leftTime += deltaTime

            if (!motion.actions)
                return

            for (let action of motion.actions) {
                if (action.key && action.target) {
                    const progress = Math.min(motion.leftTime / motion.duration, 1.0)
                    this.obj[action.key] = this.interpolation(
                        this.motionStart[action.key],
                        action.target,
                        progress,
                        motion.easing)
                }
            }
        }
    }
}