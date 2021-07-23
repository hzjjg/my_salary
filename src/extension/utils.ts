/**
 * 获取今日日期的字符串: 2019-3-16
 */
export function todayStr() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

/**
 * 获取某个时间在当天的时间戳
 * @param hourString 时间 如 9:00
 */
export function timestampOf(hourString: string) {
    const timeArr = hourString.split(':')
    if (timeArr.length !== 2) {
        throw new Error("时间格式错误");
    }

    let [hour, minute] = timeArr as unknown[]

    if (isNaN(hour as number) || hour as number > 24 || hour as number < 0) {
        throw new Error("时间格式错误");
    }

    if (isNaN(minute as number) || minute as number > 60 || minute as number < 0) {
        throw new Error("时间格式错误");
    }

    return new Date(`${todayStr()} ${hourString}`).getTime();
}