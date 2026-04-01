package com.individual.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.individual.entity.dto.TokenAdminInfoDTO;
import com.individual.entity.dto.UserInfoDTO;
import com.individual.entity.vo.ResponseVO;
import com.individual.entity.vo.UserVO;
import com.individual.exception.BusinessException;
import com.individual.service.UserInfoService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@Slf4j
@Validated
public class UserController extends ABaseController {

    @Resource
    private UserInfoService userInfoService;

    /**
     * 分页查询用户列表
     * 支持按账号、角色、状态等条件筛选
     *
     * @param userInfoDTO 查询参数，包含分页信息
     * @return ResponseVO 包含用户列表分页数据
     */
    @PostMapping("/getUserList")
    public ResponseVO getUserList(@RequestBody UserInfoDTO userInfoDTO) {
        TokenAdminInfoDTO tokenUserInfoDTO = getTokenUserInfo(null);
        if (tokenUserInfoDTO == null) {
            throw new BusinessException("请先登录");
        }
        IPage<UserVO> userPage = userInfoService.getUserList(userInfoDTO);
        return getSuccessResponseVO(userPage);
    }
}
