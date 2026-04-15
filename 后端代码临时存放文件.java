package com.individual.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.individual.entity.dto.CodeDuplicateCheckDTO;
import com.individual.entity.dto.TokenAdminInfoDTO;
import com.individual.entity.dto.TokenTeacherInfoDTO;
import com.individual.entity.vo.CodeDuplicateCheckVO;
import com.individual.entity.vo.ResponseVO;
import com.individual.exception.BusinessException;
import com.individual.service.CodeDuplicateCheckService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// 教师端代码查重控制器
@RestController
@RequestMapping("/codeDuplicateCheck")
@Slf4j
@Validated
public class CodeDuplicateCheckController extends ABaseController {

    @Resource
    private CodeDuplicateCheckService codeDuplicateCheckService;

    /**
     * 分页查询代码查重记录列表
     */
    @PostMapping("/getList")
    public ResponseVO getList(@RequestBody CodeDuplicateCheckDTO dto) {
        // 从 Token 中获取当前登录教师信息
        TokenAdminInfoDTO tokenAdminInfoDTO = this.getTokenUserInfo(null);
        if (tokenAdminInfoDTO == null){
            throw new BusinessException("请先登录");
        }

        // 调用服务层查询分页列表
        IPage<CodeDuplicateCheckVO> page = codeDuplicateCheckService.getCodeDuplicateCheckList(dto);
        return getSuccessResponseVO(page);
    }

    /**
     * 下载查重结果文件
     */
    @GetMapping("/downloadResult")
    public void downloadResult(@RequestParam("id") Integer id, HttpServletResponse response) {
        // 从 Token 中获取当前登录教师信息
        TokenAdminInfoDTO tokenAdminInfoDTO = this.getTokenUserInfo(null);
        if (tokenAdminInfoDTO == null){
            throw new BusinessException("请先登录");
        }

        // 调用服务层下载结果文件
        codeDuplicateCheckService.downloadResult(id, response);
    }
}
