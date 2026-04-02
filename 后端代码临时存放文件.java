package com.individual.controller;

import com.individual.entity.dto.DefenseArrangementDTO;
import com.individual.entity.dto.TokenTeacherInfoDTO;
import com.individual.entity.vo.ResponseVO;
import com.individual.exception.BusinessException;
import com.individual.service.DefenseArrangementService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/defenseArrangement")
@Slf4j
@Validated
public class DefenseArrangementController extends ABaseController{

    @Resource
    private DefenseArrangementService defenseArrangementService;

    /**
     * 获取答辩安排信息
     * @return
     */
    @PostMapping("/getDefenseArrangement")
    public ResponseVO getDefenseArrangement(@RequestBody DefenseArrangementDTO defenseArrangementDTO){
        TokenTeacherInfoDTO tokenTeacherInfoDTO = this.getTokenUserInfo(null);
        if (tokenTeacherInfoDTO == null){
            throw new BusinessException("请先登录");
        }
        defenseArrangementDTO.setDeptName(tokenTeacherInfoDTO.getDeptName());
        return getSuccessResponseVO(this.defenseArrangementService.getDefenseArrangement(defenseArrangementDTO));
    }

    /**
     * 安排答辩
     *
     * @param defenseArrangementDTO
     * @return
     */
    @PostMapping("/deptArrange")
    public ResponseVO deptArrange(@RequestBody DefenseArrangementDTO defenseArrangementDTO){
        TokenTeacherInfoDTO tokenTeacherInfoDTO = this.getTokenUserInfo(null);
        if (tokenTeacherInfoDTO == null){
            throw new BusinessException("请先登录");
        }
        defenseArrangementDTO.setDeptName(tokenTeacherInfoDTO.getDeptName());
        this.defenseArrangementService.deptArrange(defenseArrangementDTO, tokenTeacherInfoDTO);
        return getSuccessResponseVO(null);
    }
}
