import { sayHelloWorld } from "./sayHello.ts";

sayHelloWorld();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    Look at the console
  </div>
`;
