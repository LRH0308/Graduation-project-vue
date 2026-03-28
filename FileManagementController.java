package com.individual.controller;

import com.individual.entity.dto.FileManagementDTO;
import com.individual.entity.dto.TokenTeacherInfoDTO;
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
     * @param fileType  文件类型（1-任务书 2-开题报告 3-中期成果 4-论文终稿 5-答辩材料）
     * @param projectId 毕业设计ID
     * @return 响应结果
     */
    @PostMapping("/upload")
    public ResponseVO uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fileType") Integer fileType,
            @RequestParam("projectId") Integer projectId
    ) {
        TokenTeacherInfoDTO tokenTeacherInfoDTO = this.getTokenUserInfo(null);
        FileManagementDTO dto = new FileManagementDTO();
        dto.setProjectId(projectId);
        dto.setUploadId(tokenTeacherInfoDTO.getId());
        dto.setUploadAccount(tokenTeacherInfoDTO.getAccount());
        dto.setUploadName(tokenTeacherInfoDTO.getName());
        FileManagementDTO result = fileManagementService.uploadFile(file, fileType, dto);
        return getSuccessResponseVO(result);
    }

    /**
     * 查询文件详情
     *
     * @param fileId 文件 ID
     * @return 文件详情
     */
    @PostMapping("/getFileDetail")
    public ResponseVO getFileDetail(@RequestParam("fileId") Integer fileId) {
        TokenTeacherInfoDTO tokenTeacherInfoDTO = this.getTokenUserInfo(null);
        if (tokenTeacherInfoDTO == null) {
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
        TokenTeacherInfoDTO tokenTeacherInfoDTO = this.getTokenUserInfo(null);
        if(tokenTeacherInfoDTO == null){
            throw new BusinessException("请先登录");
        }
        fileManagementService.downloadFile(fileId, response);
    }

    /**
     * 在线预览文件（通过静态资源映射）
     *
     * @param fileId 文件 ID
     * @return 文件访问路径
     */
    @PostMapping("/getPreviewUrl")
    public ResponseVO getPreviewUrl(@RequestParam("fileId") Integer fileId) {
        TokenTeacherInfoDTO tokenTeacherInfoDTO = this.getTokenUserInfo(null);
        if (tokenTeacherInfoDTO == null) {
            throw new BusinessException("请先登录");
        }

        FileManagementVO fileDetail = fileManagementService.getFileById(fileId);
        if (fileDetail == null) {
            throw new BusinessException("文件不存在");
        }

        // 构建前端可访问的完整 URL 路径
        // 格式：http://localhost:9094/teacher/static/file/project_1/type_1/xxx.pdf
        String previewUrl = "/static/file/" + fileDetail.getFilePath();

        log.info("生成文件预览 URL: {}", previewUrl);

        return getSuccessResponseVO(previewUrl);
    }
}
