package com.individual.controller;

import com.individual.entity.dto.GuidanceRelationDTO;
import com.individual.entity.dto.TokenTeacherInfoDTO;
import com.individual.entity.vo.ResponseVO;
import com.individual.exception.BusinessException;
import com.individual.service.GuidanceRelationService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/GuidanceRelation")
@Slf4j
@Validated
public class GuidanceRelationController extends ABaseController{

    @Resource
    private GuidanceRelationService guidanceRelationService;

    /**
     * 指导关系
     * @return
     */
    @PostMapping("/getGuidanceRelation")
    public ResponseVO getGuidanceRelation(@RequestBody GuidanceRelationDTO guidanceRelationDTO){
        TokenTeacherInfoDTO tokenTeacherInfoDTO = this.getTokenUserInfo(null);
        if (tokenTeacherInfoDTO == null){
            throw new BusinessException("请先登录");
        }
        guidanceRelationDTO.setTeacherId(tokenTeacherInfoDTO.getTeacherId());
        if(guidanceRelationDTO.getGraduationTime() == null) {
            String currentYear = String.valueOf(LocalDate.now().getYear());
            guidanceRelationDTO.setGraduationTime(currentYear + "届");
        }
        return getSuccessResponseVO(
                this.guidanceRelationService.getGuidanceRelation(guidanceRelationDTO));
    }
}
