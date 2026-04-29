package com.individual.controller;

import com.individual.entity.dto.GuidanceRelationBatchImportDTO;
import com.individual.entity.dto.GuidanceRelationDTO;
import com.individual.entity.dto.TokenTeacherInfoDTO;
import com.individual.entity.enums.UserTypeEnum;
import com.individual.entity.vo.BatchImportResultVO;
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

import java.util.List;

@RestController
@RequestMapping("/guidanceRelation")
@Slf4j
@Validated
public class GuidanceRelationController extends ABaseController {

    @Resource
    private GuidanceRelationService guidanceRelationService;

    /**
     * 分页查询师生关系信息
     * @return
     */
    @PostMapping("/getGuidanceRelation")
    public ResponseVO getGuidanceRelation(@RequestBody GuidanceRelationDTO relationDTO){
        TokenTeacherInfoDTO tokenTeacherInfoDTO = this.getTokenUserInfo(null);
        if (tokenTeacherInfoDTO == null){
            throw new BusinessException("请先登录");
        }
        relationDTO.setDeptName(tokenTeacherInfoDTO.getDeptName());
        return getSuccessResponseVO(this.guidanceRelationService.getGuidanceRelation(relationDTO));
    }

    /**
     * 批量导入师生关系（支持一对多，支持多个导师）
     * @param batchImportDTOList 批量导入数据列表
     * 请求示例：
     * [
     *   {
     *     "teacherId": 1,
     *     "studentIds": [2, 3, 4]
     *   },
     *   {
     *     "teacherId": 5,
     *     "studentIds": [6, 7]
     *   }
     * ]
     * @return 导入结果
     */
    @PostMapping("/batchImportRelations")
    public ResponseVO batchImportRelations(@RequestBody List<GuidanceRelationBatchImportDTO> batchImportDTOList){
        TokenTeacherInfoDTO tokenTeacherInfoDTO = this.getTokenUserInfo(null);
        if (tokenTeacherInfoDTO == null){
            throw new BusinessException("请先登录");
        }

        BatchImportResultVO result = this.guidanceRelationService.batchImportRelations(batchImportDTOList);
        return getSuccessResponseVO(result);
    }

    /**
     * 更新师生关系信息
     * @param relationDTO 师生关系信息
     * @return 更新结果
     */
    @PostMapping("/updateGuidanceRelation")
    public ResponseVO updateGuidanceRelation(@RequestBody GuidanceRelationDTO relationDTO){
        TokenTeacherInfoDTO tokenTeacherInfoDTO = this.getTokenUserInfo(null);
        if (tokenTeacherInfoDTO == null){
            throw new BusinessException("请先登录");
        }
        this.guidanceRelationService.updateRelation(relationDTO, UserTypeEnum.DEPARTMENT_HEAD.getCode());
        return getSuccessResponseVO("师生关系更新成功");
    }
}
