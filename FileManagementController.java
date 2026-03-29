package com.individual.controller;

import com.individual.entity.dto.FileManagementDTO;
import com.individual.entity.dto.TokenStudentInfoDTO;
import com.individual.entity.vo.FileManagementVO;
import com.individual.entity.vo.ResponseVO;
import com.individual.exception.BusinessException;
import com.individual.service.FileManagementService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/file")
@Slf4j
@Validated
public class FileManagementController extends ABaseController {

    @Resource
    private FileManagementService fileManagementService;

    /**
     * 上传文件
     *
     * @param file      上传的文件
     * @param fileType  文件类型（1-任务书 2-开题报告 3-中期成果 4-论文初稿 5-论文终稿 6-答辩材料）
     * @param projectId 毕业设计 ID
     * @return 响应结果
     */
    @PostMapping("/upload")
    public ResponseVO uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fileType") Integer fileType) {
        TokenStudentInfoDTO tokenStudentInfoDTO = this.getTokenUserInfo(null);
        if (tokenStudentInfoDTO == null) {
            throw new BusinessException("请先登录");
        }
        FileManagementDTO dto = new FileManagementDTO();
        dto.setProjectId(tokenStudentInfoDTO.getTopicId());
        dto.setUploadId(tokenStudentInfoDTO.getStudentId());
        dto.setUploadAccount(tokenStudentInfoDTO.getStudentAccount());
        dto.setUploadName(tokenStudentInfoDTO.getName());
        FileManagementDTO result = fileManagementService.uploadFile(file, fileType, dto);
        return getSuccessResponseVO(result);
    }

    /**
     * 查询课题文件列表
     *
     * @param projectId 毕业设计 ID
     * @return 文件列表
     */
    @PostMapping("/getFileList")
    public ResponseVO getFileList(@RequestParam("projectId") Integer projectId) {
        TokenStudentInfoDTO tokenStudentInfoDTO = this.getTokenUserInfo(null);
        if (tokenStudentInfoDTO == null) {
            throw new BusinessException("请先登录");
        }
        List<FileManagementVO> fileList = fileManagementService.getFileListByProjectId(projectId);
        return getSuccessResponseVO(fileList);
    }

    /**
     * 查询文件详情
     *
     * @param fileId 文件 ID
     * @return 文件详情
     */
    @PostMapping("/getFileDetail")
    public ResponseVO getFileDetail(@RequestParam("fileId") Integer fileId) {
        TokenStudentInfoDTO tokenStudentInfoDTO = this.getTokenUserInfo(null);
        if (tokenStudentInfoDTO == null) {
            throw new BusinessException("请先登录");
        }
        FileManagementVO fileDetail = fileManagementService.getFileById(fileId);
        return getSuccessResponseVO(fileDetail);
    }

    /**
     * 下载文件
     *
     * @param fileId   文件 ID
     * @param response HTTP 响应对象
     */
    @GetMapping("/download")
    public void downloadFile(@RequestParam("fileId") Integer fileId, HttpServletResponse response) {
        TokenStudentInfoDTO tokenStudentInfoDTO = this.getTokenUserInfo(null);
        if (tokenStudentInfoDTO == null) {
            throw new BusinessException("请先登录");
        }
        fileManagementService.downloadFile(fileId, response);
    }
}
