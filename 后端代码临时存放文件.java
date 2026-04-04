package com.individual.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.individual.entity.dto.ProcessNodeConfigDTO;
import com.individual.entity.dto.TokenStudentInfoDTO;
import com.individual.entity.vo.ProcessNodeConfigVO;
import com.individual.entity.vo.ResponseVO;
import com.individual.exception.BusinessException;
import com.individual.service.ProcessNodeConfigService;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/processNode")
@Slf4j
@Validated
public class ProcessNodeConfigController extends ABaseController {

    @Resource
    private ProcessNodeConfigService processNodeConfigService;

    @PostMapping("/getList")
    public ResponseVO getProcessNodeConfigList(@RequestBody ProcessNodeConfigDTO processNodeConfigDTO) {
        TokenStudentInfoDTO tokenStudentInfoDTO = this.getTokenUserInfo(null);
        if (tokenStudentInfoDTO == null){
            throw new BusinessException("请先登录！");
        }
        IPage<ProcessNodeConfigVO> page = processNodeConfigService.getProcessNodeConfigList(processNodeConfigDTO);
        return getSuccessResponseVO(page);
    }

    @GetMapping("/timeVerification")
    public ResponseVO timeVerification(@NotEmpty @RequestParam String nodeCode) {
        TokenStudentInfoDTO tokenStudentInfoDTO = this.getTokenUserInfo(null);
        if (tokenStudentInfoDTO == null){
            throw new BusinessException("请先登录！");
        }
        processNodeConfigService.timeVerification(nodeCode);
        return getSuccessResponseVO("时间验证通过");
    }
}
