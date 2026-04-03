package com.individual.controller;

import com.individual.entity.dto.ForeignLanguageTranslationDTO;
import com.individual.entity.dto.TokenAdminInfoDTO;
import com.individual.entity.dto.TokenTeacherInfoDTO;
import com.individual.entity.vo.ResponseVO;
import com.individual.exception.BusinessException;
import com.individual.service.ForeignLanguageTranslationService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/foreignLanguageTranslation")
@Slf4j
@Validated
public class ForeignLanguageTranslationController extends ABaseController{

    @Resource
    private ForeignLanguageTranslationService ForeignLanguageTranslationService;

    /**
     * 获取
     * @return
     */
    @PostMapping("/getForeignLanguageTranslation")
    public ResponseVO getForeignLanguageTranslation(
            @RequestBody ForeignLanguageTranslationDTO foreignLanguageTranslationDTO){
        TokenAdminInfoDTO tokenAdminInfoDTO = this.getTokenUserInfo(null);
        if(null == tokenAdminInfoDTO){
            throw new BusinessException("请先登录！");
        }
        return getSuccessResponseVO(
                this.ForeignLanguageTranslationService.getForeignLanguageTranslationListByCondition(foreignLanguageTranslationDTO));
    }
}
