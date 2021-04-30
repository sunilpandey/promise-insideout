import { PPromise, IReject, IResolve } from "./promise-pollyfill";

let pollyFillPromise = new PPromise((resolve: IResolve<number>, reject?: IReject) => {
    setTimeout(() => {
        resolve(10);
    }, 2000);


})

pollyFillPromise.then().catch((e) => {
})

pollyFillPromise.then((value?: number) => {
    console.log("Resolved value: ", value);
    console.log("First Level", value);
    throw "I should be executed in catch";
}).then(value => {
    console.log(value)
    return 20;
}).then(value => {
    console.log("Promise resolve with value", value);
}).catch(err => console.log(err));

pollyFillPromise.then((value?: number) => {
    console.log("I am second level then of same promise");
    throw "I am throwing an error"
}).catch(error => {
    console.log(error);
    return 10;
}).then(data => console.log(data));