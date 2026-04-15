package com.individual.controller;

import com.individual.entity.dto.ReferenceCheckDTO;
import com.individual.entity.dto.TokenStudentInfoDTO;
import com.individual.entity.vo.ReferenceCheckVO;
import com.individual.entity.vo.ResponseVO;
import com.individual.exception.BusinessException;
import com.individual.service.ReferenceCheckService;
import com.individual.service.ThesisDraftService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/referenceCheck")
@Slf4j
@Validated
public class ReferenceCheckController extends ABaseController {

    @Resource
    private ReferenceCheckService referenceCheckService;

    /**
     * 参考文献格式校对
     *
     * @param dto 包含待校对的参考文献文本
     * @return 校对结果
     */
    @PostMapping("/checkReference")
    public ResponseVO checkReference(@RequestBody @Validated ReferenceCheckDTO dto) {
        TokenStudentInfoDTO tokenStudentInfoDTO = this.getTokenUserInfo(null);
        if (tokenStudentInfoDTO == null) {
            throw new BusinessException("请先登录");
        }
        ReferenceCheckVO result = referenceCheckService.checkReferenceFormat(dto);
        return getSuccessResponseVO(result);
    }

}
