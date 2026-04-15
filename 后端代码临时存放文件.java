package com.individual.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.individual.entity.dto.CodeDuplicateCheckDTO;
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
     * 上传两个文件并进行代码相似度比对
     */
    @PostMapping("/uploadAndCompare")
    public ResponseVO uploadAndCompare(
            @RequestParam("sourceFile") MultipartFile sourceFile,
            @RequestParam("comparisonFile") MultipartFile comparisonFile
    ) {
        // 从 Token 中获取当前登录教师信息
        TokenTeacherInfoDTO tokenUserInfo = getTokenUserInfo(null);
        if (tokenUserInfo == null) {
            throw new BusinessException("请先登录");
        }

        // 构建操作人信息对象
        CodeDuplicateCheckDTO operatorInfo = new CodeDuplicateCheckDTO();
        operatorInfo.setOperatorId(tokenUserInfo.getTeacherId());
        operatorInfo.setOperatorAccount(tokenUserInfo.getTeacherAccount());
        operatorInfo.setOperatorName(tokenUserInfo.getName());
        operatorInfo.setOperatorRole(tokenUserInfo.getRoleType());

        // 调用服务层执行代码查重
        CodeDuplicateCheckVO result = codeDuplicateCheckService.uploadAndCompare(
                sourceFile, comparisonFile, operatorInfo
        );

        // 返回成功响应
        return getSuccessResponseVO(result);
    }

    /**
     * 分页查询代码查重记录列表
     */
    @PostMapping("/getList")
    public ResponseVO getList(@RequestBody CodeDuplicateCheckDTO dto) {
        // 从 Token 中获取当前登录教师信息
        TokenTeacherInfoDTO tokenUserInfo = getTokenUserInfo(null);
        if (tokenUserInfo == null) {
            throw new BusinessException("请先登录");
        }

        // 设置查询条件为当前教师的账号，只能查看自己的查重记录
        dto.setOperatorAccount(tokenUserInfo.getTeacherAccount());

        // 调用服务层查询分页列表
        IPage<CodeDuplicateCheckVO> page = codeDuplicateCheckService.getCodeDuplicateCheckList(dto);
        return getSuccessResponseVO(page);
    }

    /**
     * 查询单个查重记录详情
     */
    @PostMapping("/getDetail")
    public ResponseVO getDetail(@RequestBody CodeDuplicateCheckDTO dto) {
        // 从 Token 中获取当前登录教师信息
        TokenTeacherInfoDTO tokenUserInfo = getTokenUserInfo(null);
        if (tokenUserInfo == null) {
            throw new BusinessException("请先登录");
        }

        // 校验查重记录ID是否为空
        if (dto.getId() == null) {
            return getServerErrorResponseVO("查重记录 ID 不能为空");
        }

        // 调用服务层查询详情
        CodeDuplicateCheckVO detail = codeDuplicateCheckService.getCodeDuplicateCheckById(dto.getId());
        return getSuccessResponseVO(detail);
    }

    /**
     * 下载查重结果文件
     */
    @GetMapping("/downloadResult")
    public void downloadResult(@RequestParam("id") Integer id, HttpServletResponse response) {
        // 从 Token 中获取当前登录教师信息
        TokenTeacherInfoDTO tokenUserInfo = getTokenUserInfo(null);
        if (tokenUserInfo == null) {
            throw new BusinessException("请先登录");
        }

        // 调用服务层下载结果文件
        codeDuplicateCheckService.downloadResult(id, response);
    }
}
