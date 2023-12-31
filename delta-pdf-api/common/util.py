# Source: https://github.com/Tribler/py-ipv8.git

import operator
import struct
from asyncio import Future, iscoroutine

maximum_integer = 2147483647

int2byte = struct.Struct(">B").pack
byte2int = operator.itemgetter(0)


def succeed(result):
    future = Future()
    future.set_result(result)
    return future


def fail(exception):
    future = Future()
    future.set_exception(exception)
    return future


def maybe_coroutine(func, *args, **kwargs):
    value = func(*args, **kwargs)
    if iscoroutine(value) or isinstance(value, Future):
        return value

    async def coro():
        return value
    return coro()


def coroutine(func):
    async def call_async(*args, **kwargs):
        return func(*args, **kwargs)
    return call_async


def env_to_list(env_value):
    return env_value.replace(' ', '').split(',')
