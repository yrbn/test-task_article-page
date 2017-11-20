$(function() {
  var offsetCount = 0;
      commentsToLoad = 5;
      userId = 1;

  getComments(false, true);

  $('body').on('click', '.js-edit-comment', function(e) {
    var $parentBlock = $(this).parent();
    var commentContent = $parentBlock.siblings('.js-comment-content').text();
    var commentAuthor = $(this).closest('.comment').data('author-name');
    var newTextArea = '<div class="comment_typing comment_typing--dynamic js-edit-comment-area clearfix">' +
                        '<span class="comment_reply-to">Editing...</span>' + 
                        '<span class="comment_cancel js-cancel-comment"><i class="fa fa-times" aria-hidden="true"></i> Cancel</span>' + 
                        '<textarea class="comment_textarea js-comment-textarea" placeholder="Your Message"></textarea>' +
                        '<input type="button" value="Send" class="comment_submit js-submit-comment" data-edit=1>' + 
                      '</div>';

    $('.js-edit-comment-area').remove();
    $(newTextArea).insertAfter($parentBlock);
    $(this).parent().siblings('.js-edit-comment-area').find('.js-comment-textarea').val(commentContent).focus();
  });

  $('body').on('click', '.js-reply-comment', function(e) {
    var $parentBlock = $(this).parent();
    var newTextArea = '<div class="comment_typing comment_typing--dynamic js-edit-comment-area clearfix">' +
                        '<span class="comment_reply-to"><i class="fa fa-share" aria-hidden="true"></i> ' + $parentBlock.closest('.comment').data('author-name') + '</span>' + 
                        '<span class="comment_cancel js-cancel-comment"><i class="fa fa-times" aria-hidden="true"></i> Cancel</span>' + 
                        '<textarea class="comment_textarea js-comment-textarea" placeholder="Your Message"></textarea>' +
                        '<input type="button" value="Send" class="comment_submit js-submit-comment" data-reply=1>' + 
                      '</div>';

    $('.js-edit-comment-area').remove();
    $(newTextArea).insertAfter($parentBlock);
    $(this).parent().siblings('.js-edit-comment-area').find('.js-comment-textarea').focus();
  });

  $('body').on('click', '.js-delete-comment', function(e) {
    var $parentBlock = $(this).closest('.comment');
    var actionData = {
          _method: 'DELETE'
        };
    var commentId = $(this).closest('.comment').data('comment-id');
    var isChild = $(this).closest('.comment').parents('.comment').length ? true : false;

    deleteComment(actionData, commentId, $parentBlock, isChild);
  });

  $('body').on('click', '.js-cancel-comment', function(e) {
    $('.js-edit-comment-area').remove();
  });

  $('body').on('click', '.js-submit-comment', function(e) {
    var $textarea = $(this).siblings('.js-comment-textarea'),
        textareaContent = $textarea.val();
        actionData = {
          content: textareaContent
        },
        commentId = null;

    if($(this).data('edit') == 1) {
      actionData._method = 'PUT';
      commentId = $(this).closest('.comment').data('comment-id');
    }

    actionData.parent = $(this).data('reply') == 1 ? $textarea.closest('.comment').data('comment-id') : null;

    if($textarea.val().length) {
      postComment(actionData, commentId, $textarea);
    } else {
      $('#alert-modal').find('.js-modal-content').text('Comment can not be empty!')
                      .end().fadeIn();
    }
  });

  $('.js-more-comments').on('click', function(e) {
    getComments(false, true);
  });

  $('.js-close-modal').on('click', function(e) {
    $(this).closest('.modal-window').fadeOut();
  })

  function getComments(toRefreshComments, toIncrOffsetCount, commentsToLoadQty, newOffsetCount) {
    var args = Array.prototype.slice.call(arguments);

    if(args.length <=2) {
      commentsToLoadQty = commentsToLoad;
      newOffsetCount = offsetCount;
    }

    $.ajax({
      url: 'http://frontend-test.pingbull.com/pages/yurii.rbn@gmail.com/comments',
      type: 'GET',
      dateType: 'json',
      data: {
          count: commentsToLoadQty,
          offset: newOffsetCount
      },
      beforeSend: function() {
        var preloader = '<div class="preload-block">' +
                          '<div class="preloader"></div>' + 
                        '</div>';

        $('.js-comments-list').append(preloader);
      },
      complete: function() {
        $('.js-comments-list').find('.preload-block').remove();
      },
      success: function(data, textStatus, jqXHR) {
        if(data.length) {
          var newCommentsList = '';
          
          $.each(data, function(index, comment) {
            newCommentsList += '<div class="comment" data-author-name="' + comment.author.name + '" data-author-id="' + comment.author.id + '" data-comment-id="' + comment.id + '">' + 
                                  '<div class="comment_avatar">' +
                                    '<img src="' + comment.author.avatar + '" alt="User Image">' + 
                                  '</div>' + 
                                  '<div class="comment_content">' + 
                                    '<div class="comment_info">' +
                                      '<span class="comment_author">' + comment.author.name + '</span>' +
                                      '<span class="comment_date"><i class="fa fa-clock-o" aria-hidden="true"></i><span class="medium-text"> ' + getDate(comment.updated_at) + '</span> at <span class="medium-text">' + getTime(comment.updated_at) + '</span></span>' +
                                    '</div>' +
                                    '<div class="comment_text js-comment-content">' + comment.content + '</div>' + 
                                    '<div class="comment_actions">';
            
            if(comment.author.id === userId) {
              newCommentsList += '<span class="comment_action js-edit-comment"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit</span>' + 
                                 '<span class="comment_action js-delete-comment"><i class="fa fa-times" aria-hidden="true"></i> Delete</span>';
            }
            
            newCommentsList += '<span class="comment_action js-reply-comment"><i class="fa fa-reply" aria-hidden="true"></i> Reply</span>' + 
                              '</div>';
  
            if(comment.children.length) {
              $.each(comment.children, function(index, child) {
                newCommentsList += '<div class="comment" data-author-id="' + child.author.id + '" data-comment-id="' + child.id + '">' + 
                                    '<div class="comment_avatar">' +
                                      '<img src="' + child.author.avatar + '" alt="User Image">' + 
                                    '</div>' + 
                                    '<div class="comment_content">' + 
                                      '<div class="comment_info">' +
                                        '<span class="comment_author">' + child.author.name + '</span>' +
                                        '<span class="comment_parent"><i class="fa fa-share" aria-hidden="true"></i> ' + comment.author.name + '</span>' +
                                        '<span class="comment_date"><i class="fa fa-clock-o" aria-hidden="true"></i><span class="medium-text"> ' + getDate(comment.updated_at) + '</span> at <span class="medium-text">' + getTime(comment.updated_at) + '</span></span>' +
                                      '</div>' + 
                                      '<div class="comment_text js-comment-content">' + child.content + '</div>';

                if(child.author.id === userId) {
                  newCommentsList += '<div class="comment_actions">' + 
                                      '<span class="comment_action js-edit-comment"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit</span>' + 
                                      '<span class="comment_action js-delete-comment"><i class="fa fa-times" aria-hidden="true"></i> Delete</span>' + 
                                     '</div>';
                }


                newCommentsList += '</div>' +
                                  '</div>';
              })
            }
  
            newCommentsList +=  '</div>' + 
                              '</div>';

          });
        }
        
        if(toRefreshComments) {
          $('.js-comments-list').empty();
          $('.js-comments-more-block').show();
        }
        
        if(data.length < 5) $('.js-comments-more-block').hide();

        if(toIncrOffsetCount) offsetCount += 5;

        $('.js-comments-list').append(newCommentsList);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $('#alert-modal').find('.js-modal-content').text(textStatus)
                        .end().fadeIn();
      }
    });
  };

  function postComment(data, id, $textarea) {
    var url = 'http://frontend-test.pingbull.com/pages/yurii.rbn@gmail.com/comments'

    if(id) url += '/' + id;

    $.ajax({
      url: url,
      type: 'POST',
      dateType: 'json',
      data: data,
      beforeSend: function() {
        var preloader = '<div class="preload-block">' +
                          '<div class="preloader"></div>' + 
                        '</div>';

        $('.js-comments-list').append(preloader);
      },
      complete: function() {
        $('.js-comments-list').find('.preload-block').remove();
      },
      success: function(data, textStatus, jqXHR) {
        var newOffsetCount = 0;
        $textarea.val('');
        $('.js-edit-comment-area').remove();
        getComments(true, false, offsetCount, newOffsetCount);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $('#alert-modal').find('.js-modal-content').text(textStatus)
                        .end().fadeIn();
      }
    });
  };

  function deleteComment(data, id, commentBlock, isChild) {
    $.ajax({
      url: 'http://frontend-test.pingbull.com/pages/yurii.rbn@gmail.com/comments/' + id,
      type: 'POST',
      dateType: 'json',
      data: data,
      beforeSend: function() {
        var preloader = '<div class="preload-block">' +
                          '<div class="preloader"></div>' + 
                        '</div>';

        $('.js-comments-list').append(preloader);
      },
      complete: function() {
        $('.js-comments-list').find('.preload-block').remove();
      },
      success: function(data, textStatus, jqXHR) {
        $(commentBlock).remove();
        if(!isChild) offsetCount -= 1;
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $('#alert-modal').find('.js-modal-content').text(textStatus)
                      .end().fadeIn();
      }
    });
  }

  function getDate(date) {
    date = new Date(date);
    var day = date.getDate(),
        month = date.getMonth() + 1,
        fullYear = date.getFullYear();

    return fullYear + '-' + '-' + padDate(month) + '-' + padDate(day);
  }

  function getTime(date) {
    date = new Date(date);
    var hours = date.getHours(),
        minutes = date.getMinutes();

    return padDate(hours) + ':' + padDate(minutes);
  }

  function padDate(val) {
    return (val < 10) ? '0' + val : '' + val;
  }
});