export function withNewLines(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    console.log();
    const result = await originalMethod.apply(this, args);
    console.log();

    return result;
  };

  return descriptor;
}
