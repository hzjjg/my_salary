import { Page } from './templates/page.template';
import { Body } from './templates/body.template';

export default (extensionPath: string) => {

    const bodyTemplate = new Body([`
    <h1>设置</h1>
        
    <div class="config-item">
        <h3 class="config-title">日工资</h3>
        <p class="config-desc">就是日工资啊</p>
        <div class="config-input">
            <input type="text" id="dailySalary" />
        </div>
    </div>

    <div class="config-item">
        <h3 class="config-title">每日工作时间</h3>
        <p class="config-desc">格式 HH:mm 例如 9:30</p>
        <div class="config-input">
            <input type="text" placeholder="上班时间" id="startWorkingTime" />
            -
            <input type="text" placeholder="下班时间" id="endWorkingTime" />
        </div>
    </div>

    <div class="config-item">
        <h3 class="config-title">货币单位（后缀）</h3>
        <p class="config-desc">会显示在工资后面，例如“元” “包狗粮”</p>
        <div class="config-input">
            <input type="text" id="unit"/>
        </div>
    </div>

    <div class="config-item">
        <h3 class="config-title">刷新金额时间间隔</h3>
        <p class="config-desc">单位ms 范围16.7 - 5000 ，default 100</p>
        <div class="config-input">
            <input type="text" id="updateInterval" />
        </div>
    </div>
    `]).value;

    return new Page(bodyTemplate, extensionPath).value;
};