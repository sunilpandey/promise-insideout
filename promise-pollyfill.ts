/**
 * Promise resolver
 */
export interface IResolve<T> {
    (value: T): void;
}

/**
 * Promise rejector
 */
export interface IReject {
    (reason: string): void;
}

enum PromiseStatus {
    Resolved,
    Rejected
}


interface IInternalPromise<T> {
    successBlock: (() => void) | undefined;
    rejectBlock: (() => void) | undefined;
    errorBlock: () => void;
    promise: PPromise<T>;
}

/**
 * Promise polyfill with feature of resolve and reject. 
 * It supports then and catch block for subscription.
 * It preserve the unique identify of promise getting resolved only once.
 */
export class PPromise<T> {
    private resolvedValue: T | undefined;
    
    returnedPromises: IInternalPromise<unknown>[] = [];
    status: PromiseStatus | undefined;
    reason: string | Error | undefined;
    constructor(promiseBody?: (resolve: IResolve<T>, reject?: IReject) => void) {
        setTimeout(() => {
            try {
                promiseBody && promiseBody(this.resolve.bind(this), this.reject.bind(this));   
            }catch(error) {
                this.reject(error);
            }
        });
    }

    /**
     * 
     * @param successBlock will be executed in case of promise is resolved
     * @param rejectBlock will be executed if promise is rejected or in case of exception in promise block
     * @returns PPromise
     */
    then<M>(successBlock?: (value?: T) => M, rejectBlock?: (reason?: string | Error) => M): PPromise<M> {
        let internalPromise = <Partial<IInternalPromise<M>>> {};
        const promise = new PPromise<M>();
        internalPromise.promise = promise;
        internalPromise.successBlock = () : void =>  {
            setTimeout(() => {
                try {
                    promise.resolve(successBlock && successBlock(this.resolvedValue))   
                } catch(e) {
                    promise.reject(e);
                }
                this.returnedPromises.splice(this.returnedPromises.indexOf(internalPromise as IInternalPromise<M>), 1);
            });
        }
        
        internalPromise.rejectBlock = () => {
            setTimeout(() => {
                try {
                    if(rejectBlock) {
                        promise.resolve(rejectBlock && rejectBlock(this.reason));
                    }else {
                        throw this.reason;
                    }
                } catch(e) {
                    promise.reject(e);
                }
                this.returnedPromises.splice(this.returnedPromises.indexOf(internalPromise as IInternalPromise<M>), 1);
            })
        }
        this.returnedPromises.push(internalPromise as IInternalPromise<M>);

        if(typeof status !== "undefined") {
            if(this.status == PromiseStatus.Resolved) {
                internalPromise.successBlock()
            } else if(this.status == PromiseStatus.Rejected) {
                internalPromise.rejectBlock();
            }
        }
        return internalPromise.promise;
    }

    /**
     * 
     * @param errorBlock will be called if promise or uper level chaining of promises throws exception.
     * @returns PPromise
     */
    catch<M>(errorBlock: (error?: Error | string) => M): PPromise<M> {
        let promise = new PPromise<M>();
        const internalPromise = <Partial<IInternalPromise<M>>>{};
        internalPromise.promise = promise;
        this.returnedPromises.push(internalPromise as IInternalPromise<M>);
        internalPromise.errorBlock = () => {
            this.returnedPromises.splice(this.returnedPromises.indexOf(internalPromise as IInternalPromise<M>), 1);
            try{
                promise.resolve(errorBlock(this.reason));
            } catch (err) {
                promise.reject(err);
            }
        }

        if(typeof status !== "undefined") {
            internalPromise.errorBlock();
        }
        return promise;
    }

    /**
     * @internal
     * Methods resolves the current promise
     */
    public resolve(value?: T): void {
        if(typeof this.status === "undefined") {
            this.status = PromiseStatus.Resolved;
            this.resolvedValue = value;
            let returnedPromises = [...this.returnedPromises];
            for(let i = 0; i < returnedPromises.length; i++) {
                const successBlock = returnedPromises[i].successBlock;
                successBlock && successBlock();
            }
        }
    }

    /**
     * @internal
     * Method rejects the current promise.
     */
    public reject(reason: string | Error): void {
        if(typeof this.status === "undefined") {
            this.reason = reason;
            this.status = PromiseStatus.Rejected;
            let returnedPromises = [...this.returnedPromises];
            for(let i = 0; i < returnedPromises.length; i++) {
                let rejectionBlock = returnedPromises[i].rejectBlock || returnedPromises[i].errorBlock;
                rejectionBlock && rejectionBlock();
            }
        }
    }
}