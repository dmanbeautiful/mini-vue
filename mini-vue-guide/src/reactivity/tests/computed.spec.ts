import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("happy path", () => {
    //ref
    //.value
    //1.缓存
    const user = reactive({
      age: 1,
    });

    const age = computed(() => {
      return user.age;
    });

    expect(age.value).toBe(1);
  });

  it("should compute lazily", () => {
    const value = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    //lazy 即不使用cValue.value getter函数都不会被调用
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    //should not compute again
    cValue.value;//get
    expect(getter).toHaveBeenCalledTimes(1);

    //should not compute untill needed
    value.foo = 2; // trigger -> effect -> get 重新执行
    expect(getter).toHaveBeenCalledTimes(1);

    //now it should compute
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    //should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
